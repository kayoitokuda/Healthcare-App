import { MessageCircle, ShieldCheck } from "lucide-react";
import { translateText, type AppLanguage } from "../i18n";

export type ReferralHelpTopic =
  | "referral-not-sent" | "referral-received" | "ready-to-schedule"
  | "records-requested" | "records-sent" | "follow-up" | "visit-completed"
  | "specialist-declined" | "insurance-denied" | "redirected" | "appointment-scheduled";

type Guidance = { contact: string; question: string };
const guidance: Record<AppLanguage, Record<ReferralHelpTopic, Guidance>> = {
  en: {
    "referral-not-sent": { contact: "Referring office", question: "Could you confirm whether the referral was sent, when, and where it was sent?" },
    "referral-received": { contact: "Specialist office", question: "Could you confirm the referral arrived and tell me whether anything else is needed?" },
    "ready-to-schedule": { contact: "Specialist office", question: "What, if anything, do I need to do before scheduling?" },
    "records-requested": { contact: "Specialist office", question: "Which records are needed, and how should they be sent?" },
    "records-sent": { contact: "Specialist office", question: "Could you confirm the records arrived and whether anything else is needed?" },
    "follow-up": { contact: "Specialist office", question: "How should I schedule the follow-up visit?" },
    "visit-completed": { contact: "Your clinician or office", question: "Could you clarify the next steps from my visit so I can record them accurately?" },
    "specialist-declined": { contact: "Specialist office, then referring office", question: "Could you explain why the referral could not be accepted and what the referring office should do next?" },
    "insurance-denied": { contact: "Health plan", question: "Could you explain the reason, any options or deadlines, and what information may be needed?" },
    "redirected": { contact: "Referring office", question: "Could you confirm who will send the referral, where it is going, and when I should check that it arrived?" },
    "appointment-scheduled": { contact: "Specialist office", question: "Is there anything I should bring or prepare for the appointment?" },
  },
  ja: {
    "referral-not-sent": { contact: "紹介元の医療機関", question: "紹介状を送付したか、送付日と送付先を確認していただけますか？" },
    "referral-received": { contact: "専門医療機関", question: "紹介状が届いているか、ほかに必要なものがあるか確認していただけますか？" },
    "ready-to-schedule": { contact: "専門医療機関", question: "予約する前に必要な手続きがあれば教えていただけますか？" },
    "records-requested": { contact: "専門医療機関", question: "どの記録が必要で、どのように送ればよいか教えていただけますか？" },
    "records-sent": { contact: "専門医療機関", question: "記録が届いているか、ほかに必要なものがあるか確認していただけますか？" },
    "follow-up": { contact: "専門医療機関", question: "再診を予約する方法を教えていただけますか？" },
    "visit-completed": { contact: "担当医または医療機関", question: "受診後の次の手順を正確に記録できるよう、確認させていただけますか？" },
    "specialist-declined": { contact: "専門医療機関、次に紹介元", question: "紹介を受け入れられなかった理由と、紹介元が次に行うことを教えていただけますか？" },
    "insurance-denied": { contact: "保険会社", question: "理由、利用できる選択肢や期限、必要な情報について教えていただけますか？" },
    "redirected": { contact: "紹介元の医療機関", question: "誰がどこへ紹介状を送り、いつ到着を確認すればよいか教えていただけますか？" },
    "appointment-scheduled": { contact: "専門医療機関", question: "受診時に持参または準備するものはありますか？" },
  },
  zh: {
    "referral-not-sent": { contact: "转诊诊所", question: "请确认转诊是否已发送、发送时间以及发送到哪里？" },
    "referral-received": { contact: "专科诊所", question: "请确认是否已收到转诊，以及是否还需要其他资料？" },
    "ready-to-schedule": { contact: "专科诊所", question: "预约前我还需要做什么吗？" },
    "records-requested": { contact: "专科诊所", question: "需要哪些资料？应该如何发送？" },
    "records-sent": { contact: "专科诊所", question: "请确认是否已收到资料，以及是否还需要其他内容？" },
    "follow-up": { contact: "专科诊所", question: "请问应该如何预约复诊？" },
    "visit-completed": { contact: "你的临床医生或诊所", question: "请说明就诊后的下一步，以便我准确记录？" },
    "specialist-declined": { contact: "专科诊所，然后联系转诊诊所", question: "请说明无法接受转诊的原因，以及转诊诊所接下来应该怎么做？" },
    "insurance-denied": { contact: "健康保险计划", question: "请说明原因、可选方案或期限，以及可能需要哪些资料？" },
    "redirected": { contact: "转诊诊所", question: "请确认谁会发送转诊、发送到哪里，以及我何时应确认已送达？" },
    "appointment-scheduled": { contact: "专科诊所", question: "就诊时我需要携带或准备什么吗？" },
  },
  es: {
    "referral-not-sent": { contact: "Consultorio que te refirió", question: "¿Podrían confirmar si enviaron la referencia, cuándo y a dónde?" },
    "referral-received": { contact: "Consultorio especialista", question: "¿Podrían confirmar si recibieron la referencia y si necesitan algo más?" },
    "ready-to-schedule": { contact: "Consultorio especialista", question: "¿Qué debo hacer, si acaso, antes de programar la cita?" },
    "records-requested": { contact: "Consultorio especialista", question: "¿Qué documentos necesitan y cómo debo enviarlos?" },
    "records-sent": { contact: "Consultorio especialista", question: "¿Podrían confirmar si recibieron los documentos y si necesitan algo más?" },
    "follow-up": { contact: "Consultorio especialista", question: "¿Cómo puedo programar la consulta de seguimiento?" },
    "visit-completed": { contact: "Tu profesional clínico o consultorio", question: "¿Podrían aclarar los siguientes pasos de mi consulta para registrarlos correctamente?" },
    "specialist-declined": { contact: "Consultorio especialista y luego el que te refirió", question: "¿Podrían explicar por qué no aceptaron la referencia y qué debería hacer ahora el consultorio que me refirió?" },
    "insurance-denied": { contact: "Plan de salud", question: "¿Podrían explicar el motivo, las opciones o fechas límite y qué información podría necesitarse?" },
    "redirected": { contact: "Consultorio que te refirió", question: "¿Podrían confirmar quién enviará la referencia, a dónde y cuándo debo verificar que llegó?" },
    "appointment-scheduled": { contact: "Consultorio especialista", question: "¿Debo llevar o preparar algo para la cita?" },
  },
  vi: {
    "referral-not-sent": { contact: "Phòng khám giới thiệu", question: "Xin xác nhận giấy giới thiệu đã được gửi chưa, gửi khi nào và đến đâu?" },
    "referral-received": { contact: "Phòng khám chuyên khoa", question: "Xin xác nhận đã nhận được giấy giới thiệu chưa và có cần thêm thông tin gì không?" },
    "ready-to-schedule": { contact: "Phòng khám chuyên khoa", question: "Tôi cần làm gì trước khi đặt lịch không?" },
    "records-requested": { contact: "Phòng khám chuyên khoa", question: "Cần những hồ sơ nào và nên gửi bằng cách nào?" },
    "records-sent": { contact: "Phòng khám chuyên khoa", question: "Xin xác nhận hồ sơ đã đến chưa và có cần thêm gì không?" },
    "follow-up": { contact: "Phòng khám chuyên khoa", question: "Tôi nên đặt lịch tái khám như thế nào?" },
    "visit-completed": { contact: "Bác sĩ hoặc phòng khám của bạn", question: "Xin làm rõ các bước tiếp theo sau buổi khám để tôi ghi lại chính xác." },
    "specialist-declined": { contact: "Phòng khám chuyên khoa, sau đó là phòng khám giới thiệu", question: "Xin giải thích vì sao không thể nhận giấy giới thiệu và phòng khám giới thiệu nên làm gì tiếp theo?" },
    "insurance-denied": { contact: "Chương trình bảo hiểm y tế", question: "Xin giải thích lý do, các lựa chọn hoặc thời hạn, và thông tin nào có thể cần thêm?" },
    "redirected": { contact: "Phòng khám giới thiệu", question: "Xin xác nhận ai sẽ gửi giấy giới thiệu, gửi đến đâu và khi nào tôi nên kiểm tra đã nhận được?" },
    "appointment-scheduled": { contact: "Phòng khám chuyên khoa", question: "Tôi cần mang theo hoặc chuẩn bị gì cho buổi khám không?" },
  },
};

export default function ReferralHelp({
  topic,
  language,
  nextTitle,
  nextDetail,
  latestUpdate,
  onRecordUpdate,
}: {
  topic: ReferralHelpTopic;
  language: AppLanguage;
  nextTitle: string;
  nextDetail: string;
  latestUpdate?: { title: string; date: string; source: string };
  onRecordUpdate: () => void;
}) {
  const text = guidance[language][topic];
  return (
    <div className="form-body referral-help">
      <p className="modal-intro">{translateText("This guidance is based on the updates you recorded for this referral.", language)}</p>
      {latestUpdate && (
        <div className="help-context">
          <span>{translateText("Latest update you recorded", language)}</span>
          <strong>{translateText(latestUpdate.title, language)}</strong>
          <small>{latestUpdate.date} · {translateText(latestUpdate.source, language)}</small>
        </div>
      )}
      <section className="help-next-step">
        <p className="eyebrow">{translateText("Suggested next step", language)}</p>
        <h3>{translateText(nextTitle, language)}</h3>
        <p>{translateText(nextDetail, language)}</p>
      </section>
      <section className="help-question">
        <h3><MessageCircle size={17} aria-hidden="true" />{translateText("Who to contact", language)}</h3>
        <strong>{text.contact}</strong>
        <p className="eyebrow">{translateText("A question you could ask", language)}</p>
        <p>{text.question}</p>
      </section>
      <p className="helper-note"><ShieldCheck size={15} aria-hidden="true" />{translateText("This is a prompt to confirm details with the office or health plan. It is not a verified status, medical advice, or a coverage decision.", language)}</p>
      <button type="button" className="primary-button full" onClick={onRecordUpdate}>{translateText("Record an update", language)}</button>
    </div>
  );
}
