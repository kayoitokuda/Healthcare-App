import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { AppLanguage } from "../i18n";

type Section = "overview" | "referrals" | "detail" | "next-steps";
type TourStep = { target: string; section: Section; title: string; body: string };
type Copy = {
  eyebrow: string; stepLabel: (current: number, total: number) => string;
  next: string; back: string; finish: string; exit: string; progress: string;
  guidedSteps: TourStep[]; emptySteps: TourStep[];
};

const copy: Record<AppLanguage, Copy> = {
  en: {
    eyebrow: "APP TOUR",
    stepLabel: (current, total) => `Step ${current} of ${total}`,
    next: "Next", back: "Back", finish: "Finish tour", exit: "Exit tour", progress: "Tour progress",
    guidedSteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "Your overview", body: "This is your home base. The summary cards show what you’ve recorded, and the next-step panel turns those updates into a question you can verify with an office." },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "My referrals", body: "Open this section to see each specialist referral, its current recorded status, and the offices involved. Choose a referral to open its full record." },
      { target: '[data-tour="referral-card"]', section: "referrals", title: "Open a referral", body: "Each card is one referral. It shows the specialist, referring office, latest recorded progress, and a shortcut to prepare a call script. Next, we’ll look inside this referral." },
      { target: '[data-tour="detail-heading"]', section: "detail", title: "Referral details", body: "Check the specialty, the two offices, and the latest status you recorded. A status here reflects your notes; the app does not verify it with either office." },
      { target: '[data-tour="journey"]', section: "detail", title: "Your referral journey", body: "This timeline brings the possible next step and your recorded events together. Add a step when something happens, and label who shared the information so confirmed details stay distinct from questions." },
      { target: '[data-tour="call-script"]', section: "detail", title: "Prepare a call script", body: "Use this to create a draft based on the referral and recent update. Review and edit it, then contact the office yourself. Nothing is sent from the app." },
      { target: '[data-tour="detail-tools"]', section: "detail", title: "Notes and coverage questions", body: "Save questions or visit notes here, and open guidance for what to ask your health plan. Verify coverage directly with the plan; the app cannot check it." },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "Next steps", body: "See follow-ups across your referrals in one place. Each suggestion is based on what you entered, so confirm the right action and timing with the office involved." },
    ],
    emptySteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "Your overview", body: "This is your home base. Once you add a referral, the summary and next-step area will reflect the updates you record." },
      { target: '[data-tour="dashboard-summary"]', section: "overview", title: "Referral summary", body: "These cards will summarize referrals in your tracker, follow-ups, recorded receipt confirmations, and referrals marked ready to schedule." },
      { target: '[data-tour="overview-next-step"]', section: "overview", title: "Your next step", body: "This panel offers a practical question based on the details you enter. With no referral added yet, it points you to start with what your clinician recommended." },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "My referrals", body: "This is where your referral records live. You can keep active referrals here and archive completed ones without losing their history." },
      { target: '[data-tour="add-referral"]', section: "referrals", title: "Add your first referral", body: "Start with the specialist and referring office if you know them. You can leave unknown details blank and fill them in later; adding a referral does not contact either office." },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "Next steps", body: "After adding a referral, this section gathers follow-up suggestions across your referrals. Suggestions are prompts to verify, not automatic status checks or medical advice." },
    ],
  },
  ja: {
    eyebrow: "アプリのツアー",
    stepLabel: (current, total) => `${total}ステップ中 ${current}ステップ目`,
    next: "次へ", back: "戻る", finish: "ツアーを終了", exit: "ツアーを終了", progress: "ツアーの進行状況",
    guidedSteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "概要", body: "ここがホーム画面です。サマリーには記録した内容が表示され、「次のステップ」では、医療機関に確認できる質問を確認できます。" },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "紹介状", body: "専門医への紹介状、記録した状況、関係する医療機関を確認できます。紹介状を選ぶと詳細が開きます。" },
      { target: '[data-tour="referral-card"]', section: "referrals", title: "紹介状を開く", body: "カードには専門医、紹介元、記録した進捗、電話用スクリプトへのショートカットが表示されます。次に詳細を見てみましょう。" },
      { target: '[data-tour="detail-heading"]', section: "detail", title: "紹介状の詳細", body: "診療科、医療機関、記録した最新状況を確認します。ここに表示される状況は入力した記録であり、医療機関への確認結果ではありません。" },
      { target: '[data-tour="journey"]', section: "detail", title: "紹介状の経過", body: "次に考えられるステップと記録した出来事を一緒に表示します。進展があったら追加し、情報を誰から聞いたか記録します。" },
      { target: '[data-tour="call-script"]', section: "detail", title: "電話用スクリプトを準備", body: "紹介状や最近の更新をもとに下書きを作ります。内容を確認・編集してから、ご自身で医療機関に連絡してください。アプリから送信されることはありません。" },
      { target: '[data-tour="detail-tools"]', section: "detail", title: "メモと保険の質問", body: "診察メモや質問を保存し、保険会社に尋ねる内容を確認できます。適用範囲は保険会社に直接確認してください。" },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "次のステップ", body: "紹介状ごとのフォローアップをまとめて確認できます。提案は入力内容に基づくため、内容や時期を医療機関に確認してください。" },
    ],
    emptySteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "概要", body: "ここがホーム画面です。紹介状を追加すると、記録した更新内容がサマリーや次のステップに反映されます。" },
      { target: '[data-tour="dashboard-summary"]', section: "overview", title: "紹介状のサマリー", body: "紹介状の数、フォローアップ、受領確認の記録、予約可能と記録された紹介状がここに表示されます。" },
      { target: '[data-tour="overview-next-step"]', section: "overview", title: "次のステップ", body: "入力した内容をもとに確認できる質問を提案します。紹介状がまだない場合は、担当医が勧めた内容から始めましょう。" },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "紹介状", body: "紹介状の記録を管理する場所です。完了した紹介状は履歴を残したままアーカイブできます。" },
      { target: '[data-tour="add-referral"]', section: "referrals", title: "最初の紹介状を追加", body: "分かる範囲で専門医と紹介元を入力します。不明な項目は後から追加できます。追加しても医療機関には連絡されません。" },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "次のステップ", body: "紹介状を追加すると、フォローアップの提案をまとめて確認できます。提案は確認のきっかけであり、自動確認や医療上の助言ではありません。" },
    ],
  },
  zh: {
    eyebrow: "应用导览",
    stepLabel: (current, total) => `第 ${current} 步，共 ${total} 步`,
    next: "下一步", back: "上一步", finish: "完成导览", exit: "退出导览", progress: "导览进度",
    guidedSteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "总览", body: "这里是你的主页。摘要卡片显示你记录的情况，“下一步”区域会根据这些记录提供可向诊所确认的问题。" },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "我的转诊", body: "在这里查看每个专科转诊、记录的状态以及相关诊所。选择一个转诊可查看完整记录。" },
      { target: '[data-tour="referral-card"]', section: "referrals", title: "打开转诊", body: "每张卡片对应一项转诊，显示专科、转诊诊所、记录的进展，并提供电话话术草稿入口。接下来看看转诊详情。" },
      { target: '[data-tour="detail-heading"]', section: "detail", title: "转诊详情", body: "查看专科、相关诊所以及你记录的最新状态。这里的状态来自你的记录，应用不会向诊所核实。" },
      { target: '[data-tour="journey"]', section: "detail", title: "转诊进度", body: "这里把可能的下一步和你记录的事件放在一起。发生新情况时添加记录，并标明信息来源。" },
      { target: '[data-tour="call-script"]', section: "detail", title: "准备电话话术", body: "应用会根据转诊和近期记录生成草稿。请先检查并编辑，再自行联系诊所；应用不会发送消息。" },
      { target: '[data-tour="detail-tools"]', section: "detail", title: "笔记和保险问题", body: "在这里保存就诊笔记或问题，并查看可以向健康计划咨询的内容。保险信息需要直接向计划确认。" },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "下一步", body: "在一个地方查看各项转诊的后续事项。建议依据你输入的信息，请向相关诊所确认具体行动和时间。" },
    ],
    emptySteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "总览", body: "这里是你的主页。添加转诊后，摘要和下一步区域会显示你记录的情况。" },
      { target: '[data-tour="dashboard-summary"]', section: "overview", title: "转诊摘要", body: "这里会汇总转诊数量、后续事项、诊所确认收到的记录，以及标记为可预约的转诊。" },
      { target: '[data-tour="overview-next-step"]', section: "overview", title: "下一步", body: "此处会根据你输入的信息提供可核实的问题。还没有转诊时，可以先从医生建议的事项开始。" },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "我的转诊", body: "在这里管理转诊记录。已完成的转诊可以归档，并保留其历史记录。" },
      { target: '[data-tour="add-referral"]', section: "referrals", title: "添加第一项转诊", body: "填写已知的专科和转诊诊所。不确定的信息可以稍后补充；添加转诊不会联系诊所。" },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "下一步", body: "添加转诊后，这里会汇总后续建议。建议只是供你核实的提示，不会自动查询状态，也不提供医疗建议。" },
    ],
  },
  es: {
    eyebrow: "RECORRIDO POR LA APP",
    stepLabel: (current, total) => `Paso ${current} de ${total}`,
    next: "Siguiente", back: "Atrás", finish: "Terminar recorrido", exit: "Salir del recorrido", progress: "Progreso del recorrido",
    guidedSteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "Tu resumen", body: "Esta es tu página principal. Las tarjetas muestran lo que registraste y el panel del siguiente paso ofrece una pregunta que puedes confirmar con un consultorio." },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "Mis referidos", body: "Aquí ves cada referido a un especialista, el estado que registraste y los consultorios involucrados. Selecciona uno para abrir su registro." },
      { target: '[data-tour="referral-card"]', section: "referrals", title: "Abre un referido", body: "Cada tarjeta representa un referido. Muestra el especialista, el consultorio que lo envió, el progreso registrado y un acceso al borrador de llamada." },
      { target: '[data-tour="detail-heading"]', section: "detail", title: "Detalles del referido", body: "Revisa la especialidad, los consultorios y el último estado que registraste. La app no verifica ese estado con ellos." },
      { target: '[data-tour="journey"]', section: "detail", title: "Tu recorrido del referido", body: "Aquí se combinan el posible siguiente paso y los eventos que registraste. Añade lo ocurrido e indica quién compartió la información." },
      { target: '[data-tour="call-script"]', section: "detail", title: "Prepara un guion de llamada", body: "La app crea un borrador basado en el referido y las novedades recientes. Revísalo y edítalo antes de contactar al consultorio; no se envía desde aquí." },
      { target: '[data-tour="detail-tools"]', section: "detail", title: "Notas y preguntas de cobertura", body: "Guarda preguntas o notas de la visita y consulta qué preguntar al plan de salud. Confirma la cobertura directamente con el plan." },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "Siguientes pasos", body: "Consulta los seguimientos de tus referidos en un solo lugar. Confirma con el consultorio la acción y el momento adecuados." },
    ],
    emptySteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "Tu resumen", body: "Esta es tu página principal. Cuando añadas un referido, el resumen mostrará las novedades que registres." },
      { target: '[data-tour="dashboard-summary"]', section: "overview", title: "Resumen de referidos", body: "Aquí se resumen tus referidos, seguimientos, confirmaciones de recepción registradas y los que marcaste como listos para programar." },
      { target: '[data-tour="overview-next-step"]', section: "overview", title: "Tu siguiente paso", body: "Este panel ofrece una pregunta práctica según la información que registres. Sin un referido, te indica empezar con lo que recomendó tu profesional clínico." },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "Mis referidos", body: "Aquí están tus registros de referidos. Puedes archivar los que terminen y conservar su historial." },
      { target: '[data-tour="add-referral"]', section: "referrals", title: "Añade tu primer referido", body: "Empieza con el especialista y el consultorio que te refirió, si los conoces. Puedes completar los datos después; la app no contacta a los consultorios." },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "Siguientes pasos", body: "Después de añadir un referido, aquí verás sugerencias de seguimiento. Son recordatorios para confirmar, no verificaciones automáticas ni consejos médicos." },
    ],
  },
  vi: {
    eyebrow: "HƯỚNG DẪN ỨNG DỤNG",
    stepLabel: (current, total) => `Bước ${current} / ${total}`,
    next: "Tiếp theo", back: "Quay lại", finish: "Kết thúc hướng dẫn", exit: "Thoát hướng dẫn", progress: "Tiến trình hướng dẫn",
    guidedSteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "Tổng quan", body: "Đây là trang chính. Các thẻ tóm tắt những gì bạn đã ghi lại; phần bước tiếp theo gợi ý câu hỏi để bạn xác nhận với phòng khám." },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "Giới thiệu của tôi", body: "Xem từng lần giới thiệu đến bác sĩ chuyên khoa, trạng thái bạn ghi lại và các phòng khám liên quan. Chọn một mục để mở hồ sơ." },
      { target: '[data-tour="referral-card"]', section: "referrals", title: "Mở một hồ sơ giới thiệu", body: "Mỗi thẻ là một hồ sơ. Thẻ hiển thị chuyên khoa, nơi giới thiệu, tiến độ đã ghi và lối tắt chuẩn bị kịch bản gọi." },
      { target: '[data-tour="detail-heading"]', section: "detail", title: "Chi tiết giới thiệu", body: "Kiểm tra chuyên khoa, các phòng khám và trạng thái mới nhất bạn đã ghi. Ứng dụng không xác minh trạng thái với phòng khám." },
      { target: '[data-tour="journey"]', section: "detail", title: "Tiến trình giới thiệu", body: "Phần này kết hợp bước tiếp theo có thể có với các sự kiện bạn ghi lại. Thêm cập nhật và ghi rõ ai đã cung cấp thông tin." },
      { target: '[data-tour="call-script"]', section: "detail", title: "Chuẩn bị kịch bản gọi", body: "Tạo bản nháp dựa trên hồ sơ và cập nhật gần đây. Hãy xem lại, chỉnh sửa rồi tự liên hệ phòng khám; ứng dụng không gửi nội dung." },
      { target: '[data-tour="detail-tools"]', section: "detail", title: "Ghi chú và câu hỏi bảo hiểm", body: "Lưu câu hỏi hoặc ghi chú buổi khám và xem nội dung cần hỏi chương trình bảo hiểm. Hãy xác nhận quyền lợi trực tiếp với chương trình." },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "Bước tiếp theo", body: "Xem các việc cần theo dõi cho nhiều hồ sơ tại một nơi. Hãy xác nhận hành động và thời điểm với phòng khám liên quan." },
    ],
    emptySteps: [
      { target: '[data-tour="overview"]', section: "overview", title: "Tổng quan", body: "Đây là trang chính. Sau khi thêm hồ sơ, phần tóm tắt và bước tiếp theo sẽ hiển thị các cập nhật bạn ghi lại." },
      { target: '[data-tour="dashboard-summary"]', section: "overview", title: "Tóm tắt giới thiệu", body: "Các thẻ này sẽ tóm tắt hồ sơ, việc cần theo dõi, xác nhận đã nhận được ghi lại và hồ sơ sẵn sàng đặt lịch." },
      { target: '[data-tour="overview-next-step"]', section: "overview", title: "Bước tiếp theo", body: "Phần này gợi ý câu hỏi dựa trên thông tin bạn nhập. Khi chưa có hồ sơ, hãy bắt đầu với đề xuất của bác sĩ." },
      { target: '[data-tour="nav-referrals"]', section: "referrals", title: "Giới thiệu của tôi", body: "Đây là nơi lưu hồ sơ giới thiệu. Bạn có thể lưu trữ hồ sơ đã hoàn tất mà vẫn giữ lịch sử." },
      { target: '[data-tour="add-referral"]', section: "referrals", title: "Thêm hồ sơ đầu tiên", body: "Bắt đầu với chuyên khoa và phòng khám giới thiệu nếu bạn biết. Có thể bổ sung chi tiết sau; ứng dụng không liên hệ phòng khám." },
      { target: '[data-tour="nav-next-steps"]', section: "next-steps", title: "Bước tiếp theo", body: "Sau khi thêm hồ sơ, phần này tổng hợp gợi ý theo dõi. Đây là lời nhắc để xác nhận, không phải kiểm tra tự động hay lời khuyên y tế." },
    ],
  },
};

export default function OnboardingTutorial({
  language,
  hasReferral,
  stepIndex,
  onStepChange,
  onClose,
}: {
  language: AppLanguage;
  hasReferral: boolean;
  stepIndex: number;
  onStepChange: (index: number, section: Section) => void;
  onClose: () => void;
}) {
  const t = copy[language] ?? copy.en;
  const steps = useMemo(() => hasReferral ? t.guidedSteps : t.emptySteps, [hasReferral, t]);
  const index = Math.min(stepIndex, steps.length - 1);
  const step = steps[index];
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [panelTop, setPanelTop] = useState(16);
  const [panelLeft, setPanelLeft] = useState(16);
  const [panelWidth, setPanelWidth] = useState(360);

  useEffect(() => {
    const findTarget = () => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(step.target));
      const target = candidates.find((item) => item.getClientRects().length > 0);
      if (!target) {
        setRect(null);
        return;
      }
      target.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center", inline: "nearest" });
      const measure = () => {
        const box = target.getBoundingClientRect();
        setRect(new DOMRect(box.x, box.y, box.width, box.height));
        const width = Math.min(360, window.innerWidth - 32);
        const heightEstimate = window.innerWidth < 560 ? 250 : 230;
        const left = Math.max(16, Math.min(box.left, window.innerWidth - width - 16));
        const below = box.bottom + 16 + heightEstimate <= window.innerHeight;
        const top = below
          ? box.bottom + 14
          : Math.max(16, Math.min(box.top - heightEstimate - 14, window.innerHeight - heightEstimate - 16));
        setPanelWidth(width);
        setPanelLeft(left);
        setPanelTop(top);
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(target);
      window.addEventListener("resize", measure);
      window.addEventListener("scroll", measure, true);
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", measure, true);
      };
    };
    let cleanup: void | (() => void);
    const frame = window.requestAnimationFrame(() => { cleanup = findTarget(); });
    return () => {
      window.cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, [step.target, stepIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && index < steps.length - 1) onStepChange(index + 1, steps[index + 1].section);
      if (event.key === "ArrowLeft" && index > 0) onStepChange(index - 1, steps[index - 1].section);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, steps, onClose, onStepChange]);

  const last = index === steps.length - 1;
  return createPortal(
    <div className="guided-tour-layer">
      <div className="guided-tour-scrim" aria-hidden="true" />
      {rect && (
        <div
          className="guided-tour-spotlight"
          aria-hidden="true"
          style={{ top: rect.top - 7, left: rect.left - 7, width: rect.width + 14, height: rect.height + 14 }}
        />
      )}
      <section
        className="guided-tour-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${t.eyebrow}: ${step.title}`}
        aria-describedby="guided-tour-description"
        style={{ top: panelTop, left: panelLeft, width: panelWidth }}
      >
        <div className="guided-tour-top">
          <div><p className="eyebrow">{t.eyebrow}</p><span aria-live="polite">{t.stepLabel(index + 1, steps.length)}</span></div>
          <button type="button" className="guided-tour-close" aria-label={t.exit} onClick={onClose}><X size={18} /></button>
        </div>
        <progress className="guided-tour-progress" max={steps.length} value={index + 1} aria-label={t.progress} />
        <h2>{step.title}</h2>
        <p id="guided-tour-description">{step.body}</p>
        {!rect && <p className="guided-tour-note">This area is outside the current view. Continue to the next section to explore the tour.</p>}
        <div className="guided-tour-actions">
          {index > 0 ? <button type="button" className="secondary-button" onClick={() => onStepChange(index - 1, steps[index - 1].section)}><ArrowLeft size={15} />{t.back}</button> : <span />}
          <button type="button" className="primary-button" onClick={() => last ? onClose() : onStepChange(index + 1, steps[index + 1].section)}>{last ? t.finish : t.next}{last ? <X size={15} /> : <ArrowRight size={15} />}</button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
