import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        clientId: process.env.GOOGLE_CLIENT_ID,
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