import React from "react";
import FormInput from "../../components/FormInput";

const Step1 = ({ errors, register, onNext }) => {
  return (
    <>
      <FormInput
        errors={errors}
        register={register}
        id="full_name"
        name={"Full Name"}
        placeholder={"Inserisci nome completo"}
        type={"text"}
      />
      <FormInput
        errors={errors}
        register={register}
        id="handle"
        name={"Username"}
        placeholder={"Inserisci handle"}
        type={"text"}
      />
      <button
        type="button"
        className="w-full py-4 mt-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 active:scale-[0.98] shadow-lg shadow-purple-500/30"
        onClick={onNext}
      >
        Continua{" "}
      </button>{" "}
    </>
  );
};

export default Step1;
