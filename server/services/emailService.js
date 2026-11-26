const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Shareet <noreply@send.shareetapp.com>";

// The only place that talks to the email provider
const sendEmail = async ({ to, subject, html }) => {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw new Error(error.message);
};

const sendResetEmail = (to, link) => {
    return sendEmail({
        to,
        subject: "إعادة تعيين كلمة المرور",
        html: `
            <div dir="rtl">
                <p>طلبت إعادة تعيين كلمة المرور لحسابك في شريط.</p>
                <p><a href="${link}">اضغط هنا لتعيين كلمة مرور جديدة</a></p>
                <p>الرابط صالح لمدة قصيرة. إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
            </div>
        `,
    });
};

module.exports = { sendResetEmail };
