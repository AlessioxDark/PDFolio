import React from "react";
import FormInput from "../../components/FormInput";
import { email, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import { Eye, EyeOff, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const schema = z.object({
    user_email: z.string().min(1, "il campo è obbligatorio"),
    password: z.string().min(1, "il campo è obbligatorio"),
    rememberMe: z.boolean().optional(),
  });
  type FormFields = z.infer<typeof schema>;
  const methods = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      rememberMe: false,
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },

    setError,
  } = methods;

  const { LoginUser } = useAuth();

  const navigate = useNavigate();
  const onSubmit = async (data) => {
    console.log("emailfff", data);
    const { error: authError } = await LoginUser({
      email: data.user_email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
    if (authError) {
      setError("root", { message: `${authError.message}` });
      return;
    }
    console.log("loginnato");
    navigate("/");
  };
  return (
    <div className="relative w-full min-h-screen p-4 flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center border border-white/60 rounded-[2rem] px-6 py-8 sm:p-10 w-full max-w-md bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-900/10 gap-8">
        <div className="flex flex-col items-center text-center">
          {/* Fake Logo Placeholder */}
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            PDF
            <span className="bg-clip-text text-transparent bg-purple-600">
              olio
            </span>
          </h1>
          <p className="text-slate-500 font-medium font-roboto">
            Bentornato! Accedi al tuo spazio.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-6 items-center"
        >
          <div className="flex flex-col gap-3 w-full">
            <FormInput
              id={"user_email"}
              type={"email"}
              placeholder={"Inserisci email"}
              name={"Email"}
              register={register}
              errors={errors}
            />
            <FormInput
              id={"password"}
              type={"password"}
              placeholder={"Inserisci password"}
              name={"Password"}
              register={register}
              errors={errors}
            />
            <div className="flex items-center gap-3 px-1">
              <input
                type="checkbox"
                id="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                {...register("rememberMe")}
              />
              <label
                htmlFor="checkbox"
                className="text-sm text-slate-600 cursor-pointer select-none"
              >
                Ricordati
              </label>
            </div>
            <div className="flex items-center gap-3 px-1">
              <p className="text-sm text-slate-600">
                Sei nuovo da queste parti?{" "}
                <Link
                  to="/signup"
                  className="text-purple-600 font-bold  hover:underline"
                >
                  Crea un account ora{" "}
                </Link>
              </p>
            </div>
            {errors.root && (
              <p className="text-red-500 text-sm">{errors.root.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-4 mt-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 active:scale-[0.98] shadow-lg shadow-purple-500/30"
          >
            Entra in PDFolio
          </button>
        </form>
        {}
      </div>
    </div>
  );
};

export default Login;
