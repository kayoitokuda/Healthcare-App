import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { AppLanguage } from "../i18n";

type Step = { title: string; body: string; Icon: typeof ClipboardList };
type Copy = {
  eyebrow: string;
  stepLabel: (current: number, total: number) => string;
  steps: Step[];
  note: string;
  back: string;
  next: string;
  finish: string;
  skip: string;
  progress: string;
};

const copy: Record<AppLanguage, Copy> = {
  en: {
    eyebrow: "A QUICK TOUR",
    stepLabel: (current, total) => `Step ${current} of ${total}`,
    steps: [
      { title: "Start with what you know", body: "Add the specialist and referring office. If a detail is unknown, you can leave it blank and add it later.", Icon: ClipboardList },
      { title: "Keep updates together", body: "Record what happened, when it happened, and who shared it. Your referral journey can continue after an appointment is scheduled.", Icon: CheckCircle2 },
      { title: "Find a next step", body: "Use your recorded updates to see a question you may want to ask. Confirm details with the office or health plan involved.", Icon: MessageCircle },
      { title: "Prepare, then follow up", body: "Review and edit a call or message draft, contact the office yourself, then record what you hear.", Icon: Phone },
    ],
    note: "Your notes are entered by you. Referral Navigator doesn’t contact offices, check their systems, verify coverage, or give medical advice.",
    back: "Back", next: "Next", finish: "Finish tour", skip: "Skip tour", progress: "Tour progress",
  },
  ja: {
    eyebrow: "クイックツアー",
    stepLabel: (current, total) => `${total}ステップ中 ${current}ステップ目`,
    steps: [
      { title: "分かっている情報から始める", body: "専門医と紹介元の医療機関を追加します。不明な項目は空欄のままにして、後から追加できます。", Icon: ClipboardList },
      { title: "更新内容をまとめて記録", body: "何が起きたか、いつ起きたか、誰から聞いたかを記録します。予約後も紹介の経過を記録できます。", Icon: CheckCircle2 },
      { title: "次に確認することを見つける", body: "記録した更新内容から、確認したい質問を見つけます。医療機関や保険会社に詳細を確認してください。", Icon: MessageCircle },
      { title: "準備してから連絡する", body: "電話やメッセージの下書きを確認・編集し、ご自身で医療機関に連絡して、聞いた内容を記録します。", Icon: Phone },
    ],
    note: "記録を入力するのはご本人です。Referral Navigatorは医療機関に連絡せず、システムを確認せず、保険適用を確認したり医療上の助言をしたりしません。",
    back: "戻る", next: "次へ", finish: "ツアーを終了", skip: "ツアーをスキップ", progress: "ツアーの進行状況",
  },
  zh: {
    eyebrow: "快速导览",
    stepLabel: (current, total) => `第 ${current} 步，共 ${total} 步`,
    steps: [
      { title: "从你已知的信息开始", body: "添加专科诊所和转诊诊所。暂时不确定的信息可以留空，之后再补充。", Icon: ClipboardList },
      { title: "集中记录进展", body: "记录发生了什么、何时发生，以及是谁告知你的。预约后也可以继续记录转诊进展。", Icon: CheckCircle2 },
      { title: "查看下一步", body: "根据你记录的更新，查看可能需要询问的问题。请向相关诊所或健康保险计划确认详情。", Icon: MessageCircle },
      { title: "做好准备，再跟进", body: "查看并编辑电话或消息草稿，自己联系诊所，然后记录你听到的内容。", Icon: Phone },
    ],
    note: "记录由你自行填写。Referral Navigator 不会联系诊所、查看其系统、核实保险承保情况或提供医疗建议。",
    back: "上一步", next: "下一步", finish: "完成导览", skip: "跳过导览", progress: "导览进度",
  },
  es: {
    eyebrow: "RECORRIDO RÁPIDO",
    stepLabel: (current, total) => `Paso ${current} de ${total}`,
    steps: [
      { title: "Empieza con lo que sabes", body: "Agrega el consultorio especialista y el que te refirió. Si no sabes un dato, déjalo en blanco y agrégalo después.", Icon: ClipboardList },
      { title: "Reúne las novedades", body: "Registra qué pasó, cuándo y quién te lo comunicó. Puedes continuar el historial después de programar una cita.", Icon: CheckCircle2 },
      { title: "Encuentra un siguiente paso", body: "Usa las novedades que registraste para ver qué podrías preguntar. Confirma los detalles con el consultorio o plan correspondiente.", Icon: MessageCircle },
      { title: "Prepárate y luego da seguimiento", body: "Revisa y edita un borrador de llamada o mensaje, contacta al consultorio y registra lo que te digan.", Icon: Phone },
    ],
    note: "Tú agregas tus notas. Referral Navigator no contacta consultorios, consulta sus sistemas, verifica cobertura ni ofrece consejos médicos.",
    back: "Atrás", next: "Siguiente", finish: "Terminar recorrido", skip: "Omitir recorrido", progress: "Progreso del recorrido",
  },
  vi: {
    eyebrow: "HƯỚNG DẪN NHANH",
    stepLabel: (current, total) => `Bước ${current} / ${total}`,
    steps: [
      { title: "Bắt đầu với thông tin bạn biết", body: "Thêm phòng khám chuyên khoa và phòng khám giới thiệu. Nếu chưa biết chi tiết nào, bạn có thể để trống rồi bổ sung sau.", Icon: ClipboardList },
      { title: "Ghi các cập nhật cùng nhau", body: "Ghi lại việc gì đã xảy ra, khi nào và ai đã cung cấp thông tin. Bạn có thể tiếp tục hành trình sau khi đặt lịch.", Icon: CheckCircle2 },
      { title: "Tìm bước tiếp theo", body: "Dựa vào các cập nhật bạn đã ghi để xem câu hỏi có thể cần hỏi. Hãy xác nhận chi tiết với phòng khám hoặc chương trình bảo hiểm liên quan.", Icon: MessageCircle },
      { title: "Chuẩn bị rồi liên hệ", body: "Xem và chỉnh sửa bản nháp cuộc gọi hoặc tin nhắn, tự liên hệ phòng khám, rồi ghi lại thông tin bạn nhận được.", Icon: Phone },
    ],
    note: "Bạn tự nhập ghi chú. Referral Navigator không liên hệ phòng khám, truy cập hệ thống của họ, xác minh bảo hiểm hoặc đưa ra lời khuyên y tế.",
    back: "Quay lại", next: "Tiếp theo", finish: "Kết thúc hướng dẫn", skip: "Bỏ qua hướng dẫn", progress: "Tiến trình hướng dẫn",
  },
};

export default function OnboardingTutorial({
  language,
  onClose,
}: {
  language: AppLanguage;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const t = copy[language];
  const step = t.steps[index];
  const Icon = step.Icon;
  const last = index === t.steps.length - 1;

  return (
    <div className="form-body onboarding-tour">
      <div className="tour-heading">
        <span className="tour-icon"><Icon size={22} aria-hidden="true" /></span>
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <p className="tour-step-label" aria-live="polite">{t.stepLabel(index + 1, t.steps.length)}</p>
        </div>
      </div>
      <progress className="tour-progress" max={t.steps.length} value={index + 1} aria-label={t.progress} />
      <section className="tour-step-content" aria-live="polite" aria-atomic="true">
        <h2>{step.title}</h2>
        <p>{step.body}</p>
      </section>
      <p className="tour-note"><ShieldCheck size={17} aria-hidden="true" /><span>{t.note}</span></p>
      <div className="tour-actions">
        <button type="button" className="text-button tour-skip" onClick={onClose}>{t.skip}</button>
        <div className="tour-nav-actions">
          {index > 0 && <button type="button" className="secondary-button" onClick={() => setIndex(index - 1)}><ArrowLeft size={16} aria-hidden="true" />{t.back}</button>}
          <button type="button" className="primary-button" onClick={() => last ? onClose() : setIndex(index + 1)}>{last ? t.finish : t.next}{last ? <CheckCircle2 size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}</button>
        </div>
      </div>
    </div>
  );
}
