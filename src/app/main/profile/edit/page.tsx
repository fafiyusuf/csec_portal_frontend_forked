'use client';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import useFormStore from '@/stores/formStore';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { FiInfo, FiUser } from 'react-icons/fi';
import * as Yup from 'yup';

const Select = React.forwardRef<HTMLSelectElement, {
  label?: string;
  error?: string | boolean;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-500">{label}</label>}
        <select
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            className || ''
          } ${
            error ? "border-red-500 focus-visible:ring-red-500" : ""
          }`}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(10, 'Must be at least 10 digits'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  birthDate: Yup.string().required('Birth date is required'),
  github: Yup.string()
    .required('GitHub is required')
    .url('Must be a valid URL')
    .matches(/github\.com/, 'Must be a GitHub URL'),
  gender: Yup.string().required('Gender is required'),
  telegramHandle: Yup.string()
    .required('Telegram handle is required')
    .matches(/^@/, 'Must start with @'),
  graduationYear: Yup.number()
    .integer('Must be a whole number')
    .min(new Date().getFullYear(), `Year must be at least ${new Date().getFullYear()}`)
    .max(new Date().getFullYear() + 10, `Year must be within 10 years`),
  specialization: Yup.string().required('Specialization is required'),
  department: Yup.string().required('Department is required'),
  mentor: Yup.string().required('Mentor is required'),
  universityId: Yup.string(),
  instagram: Yup.string(),
  linkedin: Yup.string(),
  codeforces: Yup.string(),
  cv: Yup.string(),
  leetcode: Yup.string(),
  joiningDate: Yup.string(),
  bio: Yup.string().max(500, 'Bio must be 500 characters or less'),
});

const ProfilePicUpload = () => {
  const { setFieldValue, values, errors, touched } = useFormikContext<any>();
  const { setProfilePicture } = useFormStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setFieldValue('profilePicture', file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (typeof values.profilePicture === 'string') {
      const imgUrl = values.profilePicture.startsWith('http') 
        ? values.profilePicture 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}${values.profilePicture}`;
      setPreview(imgUrl);
    }
  }, [values.profilePicture]);

  return (
    <div className=" mb-8">
      <div className=" gap-4">
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Profile preview" 
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              onError={() => setPreview(null)}
            />
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-600 cursor-pointer" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                onClick={() => fileInputRef.current?.click()}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        ) : (
          <div 
            className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer border-4 border-dashed border-gray-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <p className="text-sm text-gray-500 mt-2">
          {values.profilePicture ? 'Click photo to change' : 'Click to upload photo'}
        </p>
      </div>
      {errors.profilePicture && touched.profilePicture && (
        <p className="mt-1 text-sm text-red-600">{errors.profilePicture.toString()}</p>
      )}
    </div>
  );
};

export default function ProfileEditPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const {
    step,
    setStep,
    formData,
    updateFormData,
    resetForm,
  } = useFormStore();

  const initialFormValues = {
    firstName: formData.firstName || user?.member?.firstName || '',
    lastName: formData.lastName || user?.member?.lastName || '',
    phoneNumber: formData.phoneNumber || user?.member?.phoneNumber || '',
    email: formData.email || user?.member?.email || '',
    birthDate: formData.birthDate || user?.member?.birthDate || '',
    github: formData.github || user?.member?.github || '',
    gender: formData.gender || user?.member?.gender || '',
    telegramHandle: formData.telegramHandle || user?.member?.telegramHandle || '',
    graduationYear: formData.graduationYear || user?.member?.graduationYear?.toString() || '',
    specialization: formData.specialization || user?.member?.specialization || '',
    department: formData.department || user?.member?.department || '',
    mentor: formData.mentor || user?.member?.mentor || '',
    universityId: formData.universityId || user?.member?.universityId || '',
    cv: formData.cv || user?.member?.cv || '',
    bio: formData.bio || user?.member?.bio || '',
    instagram: formData.instagram || user?.member?.instagramHandle || '',
    linkedin: formData.linkedin || user?.member?.linkedinHandle || '',
    codeforces: formData.codeforces || user?.member?.codeforcesHandle || '',
    leetcode: formData.leetcode || user?.member?.leetcodeHandle || '',
    profilePicture: formData.profilePicture || user?.member?.profilePicture || '',
    joiningDate: formData.joiningDate || user?.member?.createdAt || '',
  };

  useEffect(() => {
    if (user && !formData.firstName) {
      updateFormData({
        ...initialFormValues,
        graduationYear: initialFormValues.graduationYear ? Number(initialFormValues.graduationYear) : null,
      });
    }
  }, [user]);

  const handleSubmit = async (values: any, { setSubmitting }: FormikHelpers<any>) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key !== 'profilePicture' && values[key] !== undefined && values[key] !== null && values[key] !== '') {
          formData.append(key, values[key]);
        }
      });
      if (values.profilePicture instanceof File) {
        formData.append('profilePicture', values.profilePicture);
      }

      // First, update the profile details
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/members/profileDetails`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Then, update the user profile in the store
      try {
        const updatedUser = {
          ...response.data,
          member: {
            ...response.data.member,
            profilePicture: response.data.member?.profilePicture || null,
            firstName: response.data.member?.firstName || values.firstName,
            lastName: response.data.member?.lastName || values.lastName,
            email: response.data.member?.email || values.email,
            phoneNumber: response.data.member?.phoneNumber || values.phoneNumber,
            birthDate: response.data.member?.birthDate || values.birthDate,
            github: response.data.member?.github || values.github,
            gender: response.data.member?.gender || values.gender,
            telegramHandle: response.data.member?.telegramHandle || values.telegramHandle,
            graduationYear: response.data.member?.graduationYear || values.graduationYear,
            specialization: response.data.member?.specialization || values.specialization,
            department: response.data.member?.department || values.department,
            mentor: response.data.member?.mentor || values.mentor,
            universityId: response.data.member?.universityId || values.universityId,
            cv: response.data.member?.cv || values.cv,
            bio: response.data.member?.bio || values.bio,
            instagramHandle: response.data.member?.instagramHandle || values.instagram,
            linkedinHandle: response.data.member?.linkedinHandle || values.linkedin,
            codeforcesHandle: response.data.member?.codeforcesHandle || values.codeforces,
            leetcodeHandle: response.data.member?.leetcodeHandle || values.leetcode,
            createdAt: response.data.member?.createdAt || values.joiningDate,
          }
        };

        await useUserStore.getState().updateUserProfile(updatedUser);
        
        toast({ title: 'Profile updated successfully!', description: 'Your changes have been saved.' });
        resetForm();
        
        // Redirect to profile page
        router.push('/main/profile');
      } catch (error) {
        console.error('Failed to update user store:', error);
        toast({ 
          title: 'Warning', 
          description: 'Profile was updated but there was an issue updating the local state. Please refresh the page.', 
          variant: 'destructive' 
        });
        router.push('/main/profile');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      if (axios.isAxiosError(error)) {
        toast({ 
          title: 'Error', 
          description: error.response?.data?.message || error.message, 
          variant: 'destructive' 
        });
      } else if (error instanceof Error) {
        toast({ 
          title: 'Error', 
          description: error.message, 
          variant: 'destructive' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async (values: any) => {
    try {
      if (step === 1) {
        await validationSchema.pick([
          'firstName',
          'lastName',
          'phoneNumber',
          'email',
          'birthDate',
          'github',
          'gender',
        ]).validate(values, { abortEarly: false });
        setStep(step + 1);
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errorMessages = error.inner.map(err => `${err.path}: ${err.message}`).join('\n');
        toast({ title: 'Validation Error', description: errorMessages, variant: 'destructive' });
      }
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg">
      <div className="flex justify-between mb-8 px-12">
        <div 
          className={`flex flex-col items-center cursor-pointer ${
            step === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'
          }`}
          onClick={() => setStep(1)}
        >
          <FiUser className={`w-6 h-6 ${step === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'}`} />
          <span className="mt-2 text-sm font-medium">Required Information</span>
        </div>
        <div 
          className={`flex flex-col items-center cursor-pointer ${
            step === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'
          }`}
          onClick={() => setStep(2)}
        >
          <FiInfo className={`w-6 h-6 ${step === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'}`} />
          <span className="mt-2 text-sm font-medium">Optional Information</span>
        </div>
      </div>
  
      <Formik
        initialValues={initialFormValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, handleChange, errors, touched, isSubmitting, ...formik }) => (
          <Form>
            {step === 1 && (
              <>
                <div className="">
                  <ProfilePicUpload />
                </div>
                <div className="grid grid-cols-2 gap-16 w-200">
                  <Input
                    label="First Name *"
                    name="firstName"
                    onChange={handleChange}
                    value={values.firstName}
                    error={touched.firstName && errors.firstName}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                  <Input
                    label="Last Name *"
                    name="lastName"
                    onChange={handleChange}
                    value={values.lastName}
                    error={touched.lastName && errors.lastName}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                  <Input
                    label="Mobile Number *"
                    name="phoneNumber"
                    onChange={handleChange}
                    value={values.phoneNumber}
                    error={touched.phoneNumber && errors.phoneNumber}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                  <Input
                    label="Email Address *"
                    name="email"
                    type="email"
                    onChange={handleChange}
                    value={values.email}
                    error={touched.email && errors.email}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                  <Input
                    label="Date of Birth *"
                    name="birthDate"
                    type="date"
                    onChange={handleChange}
                    value={values.birthDate}
                    error={touched.birthDate && errors.birthDate}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                  <Input
                    label="GitHub *"
                    name="github"
                    onChange={handleChange}
                    value={values.github}
                    error={touched.github && errors.github}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                  <Select
                    label="Gender *"
                    name="gender"
                    onChange={handleChange}
                    value={values.gender}
                    error={touched.gender && errors.gender}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </Select>
                </div>
              </>
            )}
  
            {step === 2 && (
              <div className="grid grid-cols-2 gap-16 w-200">
                <Input
                  label="Telegram Handle *"
                  name="telegramHandle"
                  onChange={handleChange}
                  value={values.telegramHandle}
                  error={touched.telegramHandle && errors.telegramHandle}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  required
                  placeholder="@username"
                />
                <Input
                  label="Expected Graduation Year *"
                  name="graduationYear"
                  type="number"
                  onChange={handleChange}
                  value={values.graduationYear}
                  error={touched.graduationYear && errors.graduationYear}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <Input
                  label="Specialization *"
                  name="specialization"
                  onChange={handleChange}
                  value={values.specialization}
                  error={touched.specialization && errors.specialization}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <Input
                  label="Department *"
                  name="department"
                  onChange={handleChange}
                  value={values.department}
                  error={touched.department && errors.department}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <Input
                  label="Mentor *"
                  name="mentor"
                  onChange={handleChange}
                  value={values.mentor}
                  error={touched.mentor && errors.mentor}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <Input
                  label="University ID"
                  name="universityId"
                  onChange={handleChange}
                  value={values.universityId}
                  error={touched.universityId && errors.universityId}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <Input
                  label="Instagram Handle"
                  name="instagram"
                  onChange={handleChange}
                  value={values.instagram || ''}
                  error={touched.instagram && errors.instagram}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="@username"
                />
                <Input
                  label="LinkedIn Account"
                  name="linkedin"
                  onChange={handleChange}
                  value={values.linkedin || ''}
                  error={touched.linkedin && errors.linkedin}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="https://linkedin.com/in/username"
                />
                <Input
                  label="Codeforces Handle"
                  name="codeforces"
                  onChange={handleChange}
                  value={values.codeforces || ''}
                  error={touched.codeforces && errors.codeforces}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <Input
                  label="CV URL"
                  name="cv"
                  onChange={handleChange}
                  value={values.cv}
                  error={touched.cv && errors.cv}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="https://example.com/your-cv"
                />
                <Input
                  label="Leetcode Handle"
                  name="leetcode"
                  onChange={handleChange}
                  value={values.leetcode || ''}
                  error={touched.leetcode && errors.leetcode}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <Input
                  label="Joining Date"
                  type="date"
                  name="joiningDate"
                  onChange={handleChange}
                  value={values.joiningDate}
                  error={touched.joiningDate && errors.joiningDate}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <div className="col-span-2 w-200">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                      Short Bio (Max 500 characters)
                    </label>
                    <textarea
                      name="bio"
                      onChange={handleChange}
                      value={values.bio}
                      className={`form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400 ${
                        touched.bio && errors.bio ? 'border-red-500 dark:border-red-400' : ''
                      }`}
                      rows={4}
                      maxLength={500}
                    />
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      {values.bio?.length || 0}/500
                    </div>
                    {touched.bio && errors.bio && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
  
            <div className="mt-8 flex justify-end space-x-4">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Back
                </Button>
              )}
              {step === 1 ? (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  onClick={() => handleNext(values)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )};