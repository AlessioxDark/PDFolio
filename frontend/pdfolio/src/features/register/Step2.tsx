import React from "react";
import FormInput from "../../components/FormInput";
import { type FieldErrors, type UseFormRegister } from "react-hook-form";

const Step2 = ({
  errors,
  register,
  onPrev,
  isSubmitting,
}: {
  errors: FieldErrors<any>;
  register: UseFormRegister<any>;
  onPrev: () => void;
  isSubmitting: boolean;
}) => {
  return (
    <>
      <FormInput
        errors={errors}
        register={register}
        id="user_email"
        name={"Email"}
        placeholder={"Inserisci email"}
        type={"email"}
      />
      <FormInput
        errors={errors}
        register={register}
        id="password"
        name={"Password"}
        placeholder={"Inserisci password"}
        type={"password"}
      />
      <FormInput
        errors={errors}
        register={register}
        id="conferma_password"
        name={"Conferma Password"}
        placeholder={"Inserisci password"}
        type={"password"}
      />
      {errors?.root && (
        <p className="text-red-500 text-sm">{errors.root.message}</p>
      )}
      <div className="flex flex-row gap-3 w-full justify-center mt-2">
        <button
          className="w-1/2 py-4 cursor-pointer border border-slate-200 text-slate-700 bg-white/50 hover:bg-white hover:border-slate-300 rounded-2xl font-bold text-lg transition-all duration-300 active:scale-[0.98] shadow-sm shadow-slate-200"
          onClick={onPrev}
        >
          Indietro
        </button>
        <button
          type="submit"
          className="w-1/2 py-4 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 active:scale-[0.98] shadow-lg shadow-purple-500/30"
        >
          {isSubmitting ? "Registrazione in corso..." : "Registrati"}
        </button>
      </div>
    </>
  );
};

export default Step2;
