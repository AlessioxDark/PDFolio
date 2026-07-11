import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router";
import Step1 from "../../features/register/Step1";
import Step2 from "../../features/register/Step2";
import { useProfile } from "../../contexts/ProfileContext";
import LoadingState from "@/components/states/LoadingState";
import { useApi } from "@/contexts/ApiContext";

const SignUp = () => {
  const schema = z.object({
    user_email: z.string().min(1, "il campo è obbligatorio"),
    password: z
      .string()
      .min(8, "La password deve avere almeno 8 caratteri")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
        "La password deve contenere almeno una lettera minuscola, una maiuscola, un numero e un carattere speciale",
      ),
    conferma_password: z.string().min(1, "il campo è obbligatorio"),
    handle: z
      .string()
      .min(1, "il campo è obbligatorio")
      .regex(/^[a-z0-9_]+$/, "Usa solo lettere minuscole, numeri e underscore")
      .transform((val) => val.toLowerCase()), // Forza il minuscolo per sicurezza,
    full_name: z
      .string()
      .min(1, "il campo è obbligatorio")
      .regex(
        /^[\p{L}\s\-']+$/u,
        "Inserisci un nome valido (solo lettere, spazi, trattini e apostrofi)",
      ),
  });
  type FormFields = z.infer<typeof schema>;
  const methods = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },

    setError,
  } = methods;
  const { loading } = useApi();
  const { SignUpUser } = useAuth();
  const { setProfileData } = useProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const onSubmit = async (data) => {
    if (data.password !== data.conferma_password) {
      setError("password", { message: "le password non sono uguali, riprova" });
      return;
    }

    const payload = {
      ...data,
      email: data.user_email,
    };

    const response = await SignUpUser(payload);
    // Gestione dell'errore
    if (response.error) {
      setError("root", {
        message:
          response.error.message || "Errore durante la registrazione. Riprova.",
      });
      return;
    }

    setProfileData({
      handle: data.handle,
      email: data.email,
      full_name: data.full_name,
    });
    navigate("/");
  };

  const nextStep = async () => {
    const fieldsStep1 = ["full_name", "handle"];
    const output = await methods.trigger(fieldsStep1);
    if (output) setCurrentStep(2);
  };
  if (loading?.sign_up) {
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-2 dark:bg-zinc-900">
      <LoadingState text={"Registrazione in corso..."} />
    </div>;
  }
  if (loading?.create_profile) {
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-2 dark:bg-zinc-900">
      <LoadingState text={"Creazione profilo in corso..."} />
    </div>;
  }
  return (
    <div className="relative w-full min-h-screen p-4 flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center border border-white/60 rounded-[2rem] px-6 py-8 sm:p-10 w-full max-w-md bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-900/10 gap-6 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          {/* Fake Logo Placeholder */}
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30 mb-4">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            PDF
            <span className="bg-clip-text text-transparent bg-accent">
              olio
            </span>
          </h1>
          <p className="text-slate-500 font-medium">
            Benvenuto! Crea un account ora.
          </p>
        </div>
        {/* <ProgressBar step={currentStep} /> */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4 items-center"
        >
          {currentStep === 1 ? (
            <Step1
              errors={errors}
              register={register}
              onNext={nextStep} // Passiamo la funzione validata
            />
          ) : (
            <Step2
              errors={errors}
              register={register}
              onPrev={() => setCurrentStep(1)}
              isSubmitting={isSubmitting}
            />
          )}{" "}
        </form>
        {currentStep === 1 && (
          <div className="flex items-center justify-center mt-2">
            <p className="text-sm text-slate-600">
              Hai già un account?{" "}
              <Link
                to="/login"
                className="text-accent font-bold hover:underline transition-all"
              >
                Accedi qui
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
