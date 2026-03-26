import * as yup from 'yup';

const phoneRegex = /^[0-9+()\-\s]{7,15}$/;

const runSchema = (schema, payload) => {
  try {
    const value = schema.validateSync(payload, { abortEarly: false, stripUnknown: true });
    return { value, errors: {} };
  } catch (err) {
    const errors = {};
    if (err.inner && Array.isArray(err.inner)) {
      err.inner.forEach((issue) => {
        if (issue.path && !errors[issue.path]) {
          errors[issue.path] = issue.message;
        }
      });
    }
    return { errors };
  }
};

const loginSchema = yup.object({
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().trim().min(6, 'Password must be at least 6 characters').required('Password is required')
});

const registerSchema = yup.object({
  name: yup.string().trim().max(80, 'Name is too long').required('Full name is required'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  phone: yup
    .string()
    .transform((val, orig) => (orig === '' ? null : val))
    .trim()
    .matches(phoneRegex, 'Enter a valid phone number')
    .nullable(),
  address: yup
    .string()
    .transform((val, orig) => (orig === '' ? null : val))
    .trim()
    .max(200, 'Address is too long')
    .nullable(),
  password: yup.string().trim().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .trim()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
  role: yup.string().oneOf(['resident', 'staff', 'admin']).default('resident')
});

const roomApplicationSchema = yup
  .object({
    roomId: yup.string().trim().required('Select a room'),
    preferredFloor: yup
      .number()
      .transform((value, originalValue) => (originalValue === '' || Number.isNaN(value) ? null : value))
      .integer('Floor must be a whole number')
      .min(1, 'Floor must be at least 1')
      .nullable(),
    roomType: yup.string().trim().required('Room type is required'),
    plannedCheckInAt: yup
      .string()
      .trim()
      .nullable()
      .test('valid-checkin', 'Enter a valid check-in datetime', (val) => !val || !Number.isNaN(new Date(val).getTime())),
    plannedCheckOutAt: yup
      .string()
      .trim()
      .nullable()
      .test('valid-checkout', 'Enter a valid check-out datetime', (val) => !val || !Number.isNaN(new Date(val).getTime()))
  })
  .test('checkout-after-checkin', 'Check-out must be after check-in', (value) => {
    if (value.plannedCheckInAt && value.plannedCheckOutAt) {
      return new Date(value.plannedCheckOutAt) > new Date(value.plannedCheckInAt);
    }
    return true;
  });

const housekeepingSchema = yup.object({
  serviceType: yup.string().trim().required('Service type is required'),
  preferredDate: yup
    .string()
    .trim()
    .required('Preferred date is required')
    .test('not-past', 'Date cannot be in the past', (val) => {
      if (!val) return false;
      const chosen = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen >= today;
    }),
  preferredTime: yup.string().trim().required('Preferred time is required')
});

const complaintSchema = yup.object({
  category: yup
    .string()
    .trim()
    .oneOf(['electrical', 'plumbing', 'cleaning', 'maintenance', 'security', 'other'], 'Choose a category')
    .required('Category is required'),
  title: yup.string().trim().min(3, 'Title is too short').max(120, 'Title is too long').required('Title is required'),
  description: yup
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(800, 'Description is too long')
    .required('Description is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'urgent']).required('Priority is required'),
  image: yup
    .mixed()
    .nullable()
    .notRequired()
    .transform((file) => (file === null ? undefined : file))
    .test('fileSize', 'Image must be under 5MB', (file) => !file || (file.size ?? 0) <= 5 * 1024 * 1024)
    .test('fileType', 'Only image files are allowed', (file) => !file || (file.type ? file.type.startsWith('image/') : true))
});

const foodFeedbackSchema = yup.object({
  rating: yup.number().integer().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5').required('Rating is required'),
  comment: yup.string().trim().max(500, 'Comment is too long').nullable()
});

const staffSchema = (requirePassword = true) =>
  yup.object({
    name: yup.string().trim().required('Name is required').max(80, 'Name is too long'),
    email: yup.string().trim().email('Enter a valid email').required('Email is required'),
    phone: yup
      .string()
      .transform((val, orig) => (orig === '' ? null : val))
      .trim()
      .matches(phoneRegex, 'Enter a valid phone number')
      .nullable(),
    staffDepartment: yup
      .string()
      .oneOf(['electrical', 'plumbing', 'cleaning', 'maintenance', 'security', 'other'], 'Choose a department')
      .required('Department is required'),
    password: requirePassword
      ? yup.string().trim().min(6, 'Password must be at least 6 characters').required('Password is required')
      : yup.string().trim().nullable().min(6, 'Password must be at least 6 characters')
  });

const roomSchema = yup.object({
  roomNumber: yup.string().trim().required('Room number is required'),
  roomType: yup.string().oneOf(['single', 'double', 'triple', 'quad']).required('Room type is required'),
  floor: yup.number().integer('Floor must be a whole number').min(1, 'Floor must be at least 1').required('Floor is required'),
  capacity: yup
    .number()
    .integer('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .required('Capacity is required'),
  rent: yup.number().min(0, 'Rent cannot be negative').required('Rent is required'),
  amenities: yup.array().of(yup.string().trim()).default([]),
  description: yup.string().trim().max(500, 'Description is too long').nullable(),
  status: yup.string().oneOf(['available', 'occupied', 'maintenance']).required('Status is required')
});

export const validateLogin = (payload) => runSchema(loginSchema, payload);
export const validateRegister = (payload) => runSchema(registerSchema, payload);
export const validateRoomApplication = (payload) => runSchema(roomApplicationSchema, payload);
export const validateHousekeeping = (payload) => runSchema(housekeepingSchema, payload);
export const validateComplaint = (payload) => runSchema(complaintSchema, payload);
export const validateFoodFeedback = (payload) => runSchema(foodFeedbackSchema, payload);
export const validateStaff = (payload, options = {}) => runSchema(staffSchema(options.requirePassword !== false), payload);
export const validateRoom = (payload) => runSchema(roomSchema, payload);
