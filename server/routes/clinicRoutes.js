const express        = require("express");
const router         = express.Router();
const mongoose       = require("mongoose");
const User           = require("../models/User");
const SubDoctor      = require("../models/SubDoctor");
const Clinic         = require("../models/Clinic");
const DoctorProfile  = require("../models/DoctorProfile");
const authMiddleware = require("../middleware/authMiddleware");

async function getAdminClinicId(user) {
  try {
    if (user.role === "doctor") {
      const raw = user.userId || user.id || user._id;
      return raw && mongoose.Types.ObjectId.isValid(raw)
        ? new mongoose.Types.ObjectId(raw) : null;
    }
    if (user.role === "sub_doctor") {
      return user.clinicId && mongoose.Types.ObjectId.isValid(user.clinicId)
        ? new mongoose.Types.ObjectId(user.clinicId) : null;
    }
    if (user.role === "receptionist") {
      return user.clinicId && mongoose.Types.ObjectId.isValid(user.clinicId)
        ? new mongoose.Types.ObjectId(user.clinicId) : null;
    }
  } catch { return null; }
  return null;
}

/* GET /api/clinic/profile */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getAdminClinicId(req.user);
    if (!clinicId) return res.status(403).json({ message: "Not authorized ❌" });

    let clinic = await Clinic.findOne({ adminDoctor: clinicId }).lean();

    if (!clinic) {
      const adminUser = await User.findById(clinicId).lean();
      clinic = {
        clinicName:     adminUser?.clinicName || "",
        address:        adminUser?.address    || "",
        contactNumber:  adminUser?.mobile     || "",
        openTime:       "09:00",
        closeTime:      "18:00",
        isOpen:         true,
        paymentMethods: [],
        facilities:     [],
        bannerPhoto:    "",
        foundedYear:    null,
      };
    }

    const adminUser  = await User.findById(clinicId).select("-password").lean();
    const subDoctors = await SubDoctor.find({ clinic: clinicId }).select("-password").lean();
    const profiles   = await DoctorProfile.find({ clinic: clinicId }).lean();

    const profileMap = {};
    profiles.forEach(p => { profileMap[String(p.doctorRef)] = p; });

    const doctors = [
      {
        _id:      adminUser._id,
        name:     adminUser.doctorName || adminUser.name || "",
        isAdmin:  true,
        isActive: true,
        type:     "admin",
        profile:  profileMap[String(adminUser._id)] || null,
      },
      ...subDoctors.map(sd => ({
        _id:      sd._id,
        name:     sd.name,
        isAdmin:  false,
        isActive: sd.isActive,
        type:     "sub_doctor",
        profile:  profileMap[String(sd._id)] || null,
      })),
    ];

    return res.json({ clinic, doctors });
  } catch (err) {
    console.error("GET CLINIC PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* POST /api/clinic/info */
router.post("/info", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only admin doctors can edit clinic info ❌" });

    const rawId = req.user.userId || req.user.id || req.user._id;
    if (!rawId || !mongoose.Types.ObjectId.isValid(rawId))
      return res.status(400).json({ message: "Invalid user ID ❌" });

    const clinicId = new mongoose.Types.ObjectId(rawId);

    const {
      clinicName, address, foundedYear, contactNumber,
      openTime, closeTime, isOpen, paymentMethods, facilities, bannerPhoto, feeStructure,
    } = req.body;

    const cleanContact = (contactNumber || "").replace(/\D/g, "").slice(0, 10);

    const update = {
      adminDoctor:    clinicId,
      clinicName:     (clinicName    || "").trim(),
      address:        (address       || "").trim(),
      foundedYear:    foundedYear    ? Number(foundedYear) : null,
      contactNumber:  cleanContact,
      openTime:       openTime       || "09:00",
      closeTime:      closeTime      || "18:00",
      isOpen:         isOpen !== undefined ? Boolean(isOpen) : true,
      paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [],
      facilities:     Array.isArray(facilities)     ? facilities     : [],
      feeStructure:   Array.isArray(feeStructure)   ? feeStructure.filter(f => f.name && String(f.name).trim()) : [],
      updatedAt:      new Date(),
    };

    if (bannerPhoto !== undefined) update.bannerPhoto = bannerPhoto;

    const clinic = await Clinic.findOneAndUpdate(
      { adminDoctor: clinicId },
      { $set: update },
      { upsert: true, new: true, runValidators: false }
    );

    if (clinicName) {
      await User.findByIdAndUpdate(clinicId, { $set: { clinicName: clinicName.trim() } });
    }

    return res.json({ message: "Clinic info saved ✅", clinic });
  } catch (err) {
    console.error("SAVE CLINIC INFO ERROR:", err);
    return res.status(500).json({ message: "Server error ❌", detail: err.message });
  }
});

/* POST /api/clinic/doctor-profile */
router.post("/doctor-profile", authMiddleware, async (req, res) => {
  try {
    const clinicId = await getAdminClinicId(req.user);
    if (!clinicId) return res.status(403).json({ message: "Not authorized ❌" });

    const {
      doctorRef, doctorType,
      photo, qualifications, specializations, languages, experience,
      consultationCharges, contactNumber, isActive,
      vacationFrom, vacationTo, vacationNote, worksElsewhere,
    } = req.body;

    if (!doctorRef || !mongoose.Types.ObjectId.isValid(doctorRef))
      return res.status(400).json({ message: "Invalid doctorRef ❌" });

    if (req.user.role === "sub_doctor") {
      if (String(req.user.subDoctorId) !== String(doctorRef))
        return res.status(403).json({ message: "You can only edit your own profile ❌" });
    }
    if (req.user.role === "receptionist")
      return res.status(403).json({ message: "Receptionists cannot edit doctor profiles ❌" });

    const cleanContact = (contactNumber || "").replace(/\D/g, "").slice(0, 10);

    const update = {
      doctorRef:   new mongoose.Types.ObjectId(doctorRef),
      doctorType:  doctorType || "admin",
      clinic:      clinicId,
      qualifications:  qualifications  || "",
      specializations: Array.isArray(specializations) ? specializations : [],
      languages:       Array.isArray(languages)       ? languages       : [],
      experience:      Number(experience) || 0,
      consultationCharges: {
        visit:     Number(consultationCharges?.visit)     || 0,
        injection: Number(consultationCharges?.injection) || 0,
        medicine:  Number(consultationCharges?.medicine)  || 0,
      },
      contactNumber: cleanContact,
      isActive:      isActive !== undefined ? Boolean(isActive) : true,
      vacationFrom:  vacationFrom || null,
      vacationTo:    vacationTo   || null,
      vacationNote:  vacationNote || "",
      worksElsewhere: {
        place:    worksElsewhere?.place    || "",
        schedule: worksElsewhere?.schedule || "",
      },
      updatedAt: new Date(),
    };

    if (photo !== undefined) update.photo = photo;

    const profile = await DoctorProfile.findOneAndUpdate(
      { doctorRef: new mongoose.Types.ObjectId(doctorRef), clinic: clinicId },
      { $set: update },
      { upsert: true, new: true }
    );

    return res.json({ message: "Doctor profile saved ✅", profile });
  } catch (err) {
    console.error("SAVE DOCTOR PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error ❌" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/clinic/public/all  — NO AUTH REQUIRED — Public patient-facing view

   KEY FIX: User model stores role:"admin_doctor" (not "doctor").
   Primary source = Clinic collection. Fallback = User with role:"admin_doctor".
───────────────────────────────────────────────────────────────────────────── */
router.get("/public/all", async (req, res) => {
  try {
    // Primary: use Clinic docs (exist once doctor saves clinic info)
    const clinics = await Clinic.find({
      adminDoctor: { $exists: true, $ne: null }
    }).lean();

    if (!clinics.length) {
      // Fallback: doctor signed up but hasn't saved clinic info yet
      // NOTE: User model role enum is "admin_doctor" not "doctor"
      const users = await User.find({ role: "admin_doctor" })
        .select("_id doctorName name clinicName address mobile")
        .lean();

      const result = users.map(user => ({
        clinicId:       String(user._id),
        clinicName:     user.clinicName || "Unnamed Clinic",
        address:        user.address    || "",
        contactNumber:  user.mobile     || "",
        openTime:       "09:00",
        closeTime:      "18:00",
        isOpen:         true,
        paymentMethods: [],
        facilities:     [],
        bannerPhoto:    "",
        foundedYear:    null,
        doctor: {
          name:             user.doctorName || user.name || "",
          photo:            "",
          qualifications:   "",
          specializations:  [],
          languages:        [],
          experience:       0,
          charges:          [],
          availabilityNote: "",
          contactNumber:    "",
          isActive:         true,
          vacationFrom:     null,
          vacationTo:       null,
          vacationNote:     "",
          worksElsewhere:   { place: "", schedule: "" },
        },
      }));
      return res.json(result);
    }

    // Collect valid adminDoctor IDs
    const adminIds = clinics
      .map(c => c.adminDoctor)
      .filter(id => id && mongoose.Types.ObjectId.isValid(String(id)));

    // Fetch matching users
    const adminUsers = await User.find({ _id: { $in: adminIds } })
      .select("_id doctorName name clinicName address mobile")
      .lean();

    const adminMap = {};
    adminUsers.forEach(u => { adminMap[String(u._id)] = u; });

    // Fetch doctor profiles
    const profiles = await DoctorProfile.find({ clinic: { $in: adminIds } }).lean();
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[`${String(p.clinic)}_${String(p.doctorRef)}`] = p;
    });

    // Build result
    const result = clinics.map(clinic => {
      const adminId = String(clinic.adminDoctor);
      const user    = adminMap[adminId] || {};
      const profile = profileMap[`${adminId}_${adminId}`] || null;

      return {
        clinicId:       adminId,
        clinicName:     clinic.clinicName    || user.clinicName || "Unnamed Clinic",
        address:        clinic.address       || user.address    || "",
        contactNumber:  clinic.contactNumber || user.mobile     || "",
        openTime:       clinic.openTime      || "09:00",
        closeTime:      clinic.closeTime     || "18:00",
        isOpen:         clinic.isOpen !== undefined ? clinic.isOpen : true,
        paymentMethods: clinic.paymentMethods || [],
        facilities:     clinic.facilities    || [],
        feeStructure:   clinic.feeStructure  || [],
        bannerPhoto:    clinic.bannerPhoto   || "",
        foundedYear:    clinic.foundedYear   || null,
        doctor: {
          name:             user.doctorName || user.name        || "",
          photo:            profile?.photo            || "",
          qualifications:   profile?.qualifications   || "",
          specializations:  profile?.specializations  || [],
          languages:        profile?.languages         || [],
          experience:       profile?.experience        || 0,
          charges:          profile?.charges           || [],
          availabilityNote: profile?.availabilityNote  || "",
          contactNumber:    profile?.contactNumber     || "",
          isActive:         profile?.isActive !== false,
          vacationFrom:     profile?.vacationFrom      || null,
          vacationTo:       profile?.vacationTo        || null,
          vacationNote:     profile?.vacationNote      || "",
          worksElsewhere:   profile?.worksElsewhere    || { place: "", schedule: "" },
        },
      };
    });

    return res.json(result);

  } catch (err) {
    console.error("PUBLIC ALL CLINICS ERROR:", err);
    return res.status(500).json({ message: "Server error ❌", detail: err.message });
  }
});

module.exports = router;