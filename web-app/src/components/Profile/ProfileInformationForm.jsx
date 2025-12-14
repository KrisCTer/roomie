import React from "react";
import FormField from "./FormField";
import { GENDER_OPTIONS } from "../../utils/genderOptions";

const ProfileInformationForm = ({ formData, onChange, onSubmit }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold mb-6">Information</h2>

      <div className="space-y-6">
        <FormField
          label="Username"
          name="username"
          value={formData.username}
          onChange={onChange}
          readOnly={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
          />
          <FormField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Email"
            name="email"
            value={formData.email}
            onChange={onChange}
          />
          <FormField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={onChange}
            options={GENDER_OPTIONS}
          />
          <FormField
            label="Date of Birth"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={onChange}
            placeholder="dd/MM/yyyy"
          />
        </div>

        <FormField
          label="ID Card Number"
          name="idCardNumber"
          value={formData.idCardNumber}
          onChange={onChange}
        />
        <FormField
          label="Permanent Address"
          name="permanentAddress"
          value={formData.permanentAddress}
          onChange={onChange}
        />
        <FormField
          label="Current Address"
          name="currentAddress"
          value={formData.currentAddress}
          onChange={onChange}
        />
      </div>

      <button
        onClick={onSubmit}
        className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Save & Update
      </button>
    </div>
  );
};

export default ProfileInformationForm;
