import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

transporter.verify()
    .then(() => {
        console.log("Mail transporter is ready");
    })
    .catch((error) => {
        console.error("Error setting up mail transporter:", error);
    });


export async function sendEmail({ to, subject, html, text }) {
    if (!to) {
        throw new Error("No recipients defined");
    }

    const mailoptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text,
    };

    const details = await transporter.sendMail(mailoptions);
    console.log("Email sent:", details);
}

export default transporter;