import React from "react";

const FormInput = ({ name, placeholder, type, id, register, errors }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {/* div */}
      <div className="w-full flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {name}
        </label>
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          className="px-4 py-3 border rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white shadow-sm focus:border-purple-500 focus:ring-1  focus:ring-purple-500 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
          {...register(id)}
        />
      </div>
      {errors[id] && (
        <span className="text-red-500 font-medium text-[13px] mt-1">
          {errors[id].message}
        </span>
      )}
    </div>
  );
};

export default FormInput;
