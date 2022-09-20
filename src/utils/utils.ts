import { Auth, Firestore, Todo_Task } from "@cuttinboard/cuttinboard-library";
import { getAnalytics, logEvent } from "firebase/analytics";
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  updatePhoneNumber,
  User,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { orderBy } from "lodash";

export const getOrderedTasks = (tasks: Record<string, Todo_Task>) =>
  orderBy(Object.entries(tasks), (task) => task[1].createdAt, "asc");

export const recordError = (error: Error, fatal?: boolean) => {
  console.error({ error, fatal });
  const analytics = getAnalytics();
  if (!analytics) {
    return;
  }
  logEvent(analytics, "exception", {
    name: error.name,
    description: error.message,
    fatal,
  });
};

/**
 * Cambiar el número de teléfono del usuario
 * - **Nota:** *Solo en WEB*
 * @param phoneNumber Nuevo número de teléfono
 */
export const changePhoneNumber = async (phoneNumber: string, user: User) => {
  const userRef = doc(Firestore, "Users", user.uid);
  try {
    const recaptcha = document.createElement("div");
    recaptcha.setAttribute("id", "recaptcha-container");
    document.body.appendChild(recaptcha);
    // 'recaptcha-container' is the ID of an element in the DOM.
    const applicationVerifier = new RecaptchaVerifier(
      recaptcha,
      { size: "invisible" },
      Auth
    );
    const provider = new PhoneAuthProvider(Auth);
    const verificationId = await provider.verifyPhoneNumber(
      phoneNumber,
      applicationVerifier
    );
    // Obtain the verificationCode from the user.
    const verificationCode = window.prompt(
      "Please enter the verification code that was sent to your phone."
    );
    const phoneCredential = PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );
    await updatePhoneNumber(user, phoneCredential);
    await updateDoc(userRef, { phoneNumber });
    document.body.removeChild(recaptcha);
  } catch (error) {
    throw error;
  }
};
