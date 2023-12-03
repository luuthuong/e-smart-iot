import emailjs from "@emailjs/browser";

export const sendMail = (params: any) => {
  emailjs.init("HZbJc9LpXCyndR34_");
  emailjs.send("service_p217544", "template_8q9l2ut", params).then((res) => {
    console.log(res);
  });
};
