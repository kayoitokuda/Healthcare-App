import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type AppLanguage = "en" | "ja" | "zh" | "es" | "vi";

const languageLocales: Record<AppLanguage, string> = {
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
  es: "es",
  vi: "vi-VN",
};

const rows: Array<[string, string, string, string, string]> = [
  ["Language", "言語", "语言", "Idioma", "Ngôn ngữ"],
  ["Possible hold-up", "遅れの可能性", "可能存在延误", "Posible demora", "Có thể bị trì hoãn"],
  ["Follow up on a possible hold-up", "遅れの可能性について確認する", "跟进可能的延误", "Dar seguimiento a una posible demora", "Theo dõi khả năng bị trì hoãn"],
  ["The latest dental X-ray may still be needed.", "最新の歯科X線画像がまだ必要な可能性があります。", "可能仍需要最新的牙科X光片。", "Es posible que aún necesiten la radiografía dental más reciente.", "Có thể vẫn cần phim X-quang răng mới nhất."],
  ["latest dental X-ray", "最新の歯科X線画像", "最新的牙科X光片", "radiografía dental más reciente", "phim X-quang răng mới nhất"],
  ["You recorded this detail from the specialist office.", "専門医療機関から聞いた内容として記録しました。", "你将此信息记录为专科诊所告知的内容。", "Registraste este dato según lo que te dijo el consultorio especialista.", "Bạn đã ghi lại thông tin này theo lời phòng khám chuyên khoa."],
  ["Peninsula Oral Surgery confirmed receipt and said they still need the latest dental X-ray before they can review it.", "Peninsula Oral Surgery は紹介状を受領したものの、確認には最新の歯科X線画像が必要だと伝えました。", "Peninsula Oral Surgery 确认已收到转诊，但表示审核前仍需要最新的牙科X光片。", "Peninsula Oral Surgery confirmó que recibió la referencia, pero aún necesita la radiografía dental más reciente para revisarla.", "Peninsula Oral Surgery xác nhận đã nhận giấy giới thiệu nhưng vẫn cần phim X-quang răng mới nhất trước khi xem xét."],
  ["Ask Bayview Dental to send latest dental X-ray to Peninsula Oral Surgery.", "Bayview Dental に最新の歯科X線画像を Peninsula Oral Surgery へ送るよう依頼してください。", "请 Bayview Dental 将最新的牙科X光片发送给 Peninsula Oral Surgery。", "Pide a Bayview Dental que envíe la radiografía dental más reciente a Peninsula Oral Surgery.", "Hãy đề nghị Bayview Dental gửi phim X-quang răng mới nhất đến Peninsula Oral Surgery."],
  ["Could you send latest dental X-ray to Peninsula Oral Surgery, and let me know when it has been sent?", "最新の歯科X線画像を Peninsula Oral Surgery に送っていただき、送付後にお知らせいただけますか？", "可以请您将最新的牙科X光片发送给 Peninsula Oral Surgery，并告知我发送时间吗？", "¿Podrían enviar la radiografía dental más reciente a Peninsula Oral Surgery e indicarme cuándo la enviaron?", "Quý vị có thể gửi phim X-quang răng mới nhất đến Peninsula Oral Surgery và cho tôi biết khi nào đã gửi không?"],
  ["Specialist recommended", "専門医を勧められた", "医生建议看专科", "Especialista recomendado", "Được đề xuất khám chuyên khoa"],
  ["Dr. Chen recommended an oral surgery consultation.", "Chen 医師から口腔外科の診察を勧められました。", "Chen 医生建议进行口腔外科会诊。", "La Dra. Chen recomendó una consulta de cirugía oral.", "Bác sĩ Chen đề xuất tư vấn phẫu thuật miệng."],
  ["Referral added to your tracker", "紹介を記録に追加しました", "已将转诊添加到记录", "Referencia añadida a tu registro", "Đã thêm lượt giới thiệu vào danh sách"],
  ["You added the details you had from your visit.", "診察で得た情報を追加しました。", "你添加了就诊时获得的信息。", "Añadiste los datos que tenías de la consulta.", "Bạn đã thêm thông tin có được từ buổi khám."],
  ["Referring office says it was sent", "紹介元が送付したと伝えています", "转诊诊所表示已发送", "El consultorio que te refirió dice que la envió", "Nơi giới thiệu cho biết đã gửi"],
  ["Bayview Dental told me they sent the referral to Peninsula Oral Surgery.", "Bayview Dental から Peninsula Oral Surgery に紹介状を送付したと聞きました。", "Bayview Dental 告诉我，他们已将转诊发送给 Peninsula Oral Surgery。", "Bayview Dental me dijo que envió la referencia a Peninsula Oral Surgery.", "Bayview Dental cho biết họ đã gửi giấy giới thiệu đến Peninsula Oral Surgery."],
  ["Referral Navigator home", "Referral Navigator ホーム", "Referral Navigator 首页", "Inicio de Referral Navigator", "Trang chủ Referral Navigator"],
  ["Main navigation", "メインナビゲーション", "主导航", "Navegación principal", "Điều hướng chính"],
  ["Dashboard navigation", "ダッシュボードナビゲーション", "控制面板导航", "Navegación del panel", "Điều hướng bảng điều khiển"],
  ["How it works", "使い方", "使用方法", "Cómo funciona", "Cách hoạt động"],
  ["REFERRAL NAVIGATOR", "紹介ナビゲーター", "转诊导航", "NAVEGADOR DE REFERENCIAS", "ĐIỀU HƯỚNG GIỚI THIỆU"],
  ["Quick actions", "クイックアクション", "快捷操作", "Acciones rápidas", "Thao tác nhanh"],
  ["Keep your referral details and follow-ups together.", "紹介の詳細とフォローアップをまとめて管理できます。", "集中管理转诊信息和后续跟进。", "Organiza los detalles de tu referencia y su seguimiento en un solo lugar.", "Quản lý thông tin giới thiệu và việc theo dõi cùng một nơi."],
  ["My referrals", "紹介一覧", "我的转诊", "Mis referencias", "Các lượt giới thiệu của tôi"],
  ["referral", "件の紹介", "项转诊", "referencia", "lượt giới thiệu"],
  ["referrals", "件の紹介", "项转诊", "referencias", "lượt giới thiệu"],
  ["in your tracker", "を記録中", "条记录", "en tu registro", "trong danh sách"],
  ["Add a referral", "紹介を追加", "添加转诊", "Añadir una referencia", "Thêm lượt giới thiệu"],
  ["Start with what you know", "わかることから始めましょう", "从已知信息开始", "Empieza con lo que sabes", "Bắt đầu với thông tin bạn biết"],
  ["Learn what this tool can do", "このツールでできることを見る", "了解此工具的功能", "Descubre qué puede hacer esta herramienta", "Tìm hiểu công cụ này có thể làm gì"],
  ["You’re in control.", "あなたが管理できます。", "由你掌控。", "Tú tienes el control.", "Bạn là người kiểm soát."],
  ["Updates are entered by you;", "更新はあなたが入力します。", "更新由你输入；", "Tú ingresas las actualizaciones;", "Bạn tự nhập thông tin cập nhật;"],
  ["referral status isn’t checked automatically.", "紹介状況は自動で確認されません。", "系统不会自动查询转诊状态。", "el estado de la referencia no se verifica automáticamente.", "trạng thái giới thiệu không được tự động kiểm tra."],
  ["Close menu", "メニューを閉じる", "关闭菜单", "Cerrar menú", "Đóng menu"],
  ["Open menu", "メニューを開く", "打开菜单", "Abrir menú", "Mở menu"],
  ["Close", "閉じる", "关闭", "Cerrar", "Đóng"],
  ["Demo · resets on refresh", "デモ · 更新するとリセット", "演示 · 刷新后重置", "Demo · se reinicia al actualizar", "Bản demo · đặt lại khi tải lại"],
  ["This preview keeps changes in memory. Refreshing clears them.", "このプレビューの変更は一時保存です。更新すると消去されます。", "此预览中的更改仅保存在内存中，刷新后会清除。", "Los cambios de esta vista previa solo se guardan temporalmente. Se borran al actualizar.", "Các thay đổi trong bản xem trước chỉ lưu tạm; tải lại trang sẽ xóa chúng."],
  ["Referral Navigator", "Referral Navigator", "Referral Navigator", "Referral Navigator", "Referral Navigator"],
  ["A patient-owned referral companion", "患者が自分で管理する紹介サポートツール", "由患者自主使用的转诊助手", "Un asistente de referencias controlado por el paciente", "Công cụ theo dõi giới thiệu do bệnh nhân tự quản lý"],
  ["FROM RECOMMENDATION TO NEXT STEP", "紹介の提案から次のステップまで", "从医生建议到下一步", "DE LA RECOMENDACIÓN AL SIGUIENTE PASO", "TỪ ĐỀ XUẤT ĐẾN BƯỚC TIẾP THEO"],
  ["Keep your specialist referral moving.", "専門医への紹介を前に進めましょう。", "让专科转诊顺利推进。", "Mantén en marcha tu referencia a un especialista.", "Giúp việc giới thiệu đến bác sĩ chuyên khoa tiếp tục tiến triển."],
  ["The Referral Agent uses updates you enter to flag possible holdups, suggest a next step, and prepare a message for you to review.", "Referral Agent は、あなたが入力した更新内容から遅れの可能性を示し、次のステップを提案して、確認用のメッセージを作成します。", "Referral Agent 会根据你输入的更新提示可能的延误、建议下一步，并准备供你审核的信息。", "El Agente de Referencias usa tus actualizaciones para señalar posibles demoras, sugerir el siguiente paso y preparar un mensaje para que lo revises.", "Referral Agent dùng thông tin bạn nhập để phát hiện khả năng bị trì hoãn, gợi ý bước tiếp theo và soạn tin nhắn để bạn xem lại."],
  ["Explore the sample tracker", "サンプルの記録を見る", "查看示例转诊记录", "Explorar el registro de ejemplo", "Xem thử danh sách mẫu"],
  ["You enter updates yourself. The app doesn’t contact offices or check their systems.", "更新はあなた自身が入力します。このアプリが医療機関に連絡したり、システムを確認したりすることはありません。", "更新由你自行输入。本应用不会联系诊所或查询其系统。", "Tú ingresas las actualizaciones. La aplicación no contacta a las clínicas ni consulta sus sistemas.", "Bạn tự nhập thông tin cập nhật. Ứng dụng không liên hệ phòng khám hoặc kiểm tra hệ thống của họ."],
  ["Still checking", "確認中", "仍在确认", "Aún en proceso", "Đang xác minh"],
  ["YOUR REFERRAL", "あなたの紹介", "你的转诊", "TU REFERENCIA", "LƯỢT GIỚI THIỆU CỦA BẠN"],
  ["Cardiology", "循環器科", "心脏科", "Cardiología", "Tim mạch"],
  ["Primary care", "かかりつけ医", "初级保健", "Atención primaria", "Chăm sóc ban đầu"],
  ["Heart clinic", "心臓クリニック", "心脏专科诊所", "Clínica cardíaca", "Phòng khám tim mạch"],
  ["Recommendation", "紹介の提案", "医生建议", "Recomendación", "Đề xuất"],
  ["You added this", "あなたが追加しました", "由你添加", "Lo agregaste tú", "Bạn đã thêm mục này"],
  ["Referral sent?", "紹介状は送付済み？", "转诊已发送？", "¿Se envió la referencia?", "Đã gửi giấy giới thiệu chưa?"],
  ["Ask the referring office", "紹介元の医療機関に確認", "询问转诊诊所", "Pregunta al consultorio que te refirió", "Hỏi nơi giới thiệu"],
  ["Received?", "届いている？", "对方收到了吗？", "¿La recibieron?", "Đã nhận được chưa?"],
  ["Confirm with the specialist", "専門医に確認", "向专科诊所确认", "Confirma con el especialista", "Xác nhận với bác sĩ chuyên khoa"],
  ["Next up: ask whether the referral was sent", "次のステップ：紹介状が送付されたか確認する", "下一步：询问转诊是否已发送", "Siguiente paso: pregunta si enviaron la referencia", "Tiếp theo: hỏi xem giấy giới thiệu đã được gửi chưa"],
  ["A CLEARER HANDOFF", "わかりやすい引き継ぎ", "让转诊交接更清晰", "UN PROCESO MÁS CLARO", "BÀN GIAO RÕ RÀNG HƠN"],
  ["Know what’s confirmed—and what to ask next.", "確認できていることと、次に聞くことがわかります。", "了解哪些信息已确认，以及接下来该问什么。", "Sabe qué está confirmado y qué preguntar después.", "Biết điều gì đã được xác nhận và cần hỏi gì tiếp theo."],
  ["Referral Navigator helps you keep the details straight while you follow up at your own pace.", "Referral Navigator は、あなたのペースでフォローアップできるよう、情報を整理します。", "Referral Navigator 帮你整理信息，让你按自己的节奏跟进。", "Referral Navigator te ayuda a organizar la información mientras haces seguimiento a tu ritmo.", "Referral Navigator giúp bạn sắp xếp thông tin và theo dõi theo nhịp độ của mình."],
  ["Save what you know", "わかっていることを記録", "记录已知信息", "Guarda lo que sabes", "Lưu thông tin bạn biết"],
  ["Note the specialist, referring office, and what your clinician recommended.", "専門医、紹介元の医療機関、担当医の提案を記録します。", "记录专科医生、转诊诊所和临床医生的建议。", "Anota el especialista, el consultorio que te refirió y la recomendación de tu profesional de salud.", "Ghi lại bác sĩ chuyên khoa, nơi giới thiệu và đề xuất của bác sĩ."],
  ["Follow up with confidence", "安心してフォローアップ", "放心跟进", "Haz seguimiento con confianza", "Theo dõi với sự tự tin"],
  ["See a practical next step and prepare a call script or message to review.", "次にできることを確認し、電話用スクリプトやメッセージを作成して確認できます。", "查看可执行的下一步，并准备电话提纲或信息供你审核。", "Consulta un siguiente paso práctico y prepara un guion de llamada o mensaje para revisar.", "Xem bước tiếp theo và chuẩn bị kịch bản gọi điện hoặc tin nhắn để xem lại."],
  ["Record what you hear", "聞いた内容を記録", "记录沟通内容", "Registra lo que te dicen", "Ghi lại điều bạn được thông báo"],
  ["Add the response and label whether it came from you or an office.", "回答を追加し、あなた自身または医療機関からの情報かを表示します。", "记录回复，并标明信息来自你本人还是诊所。", "Añade la respuesta e indica si provino de ti o de un consultorio.", "Thêm phản hồi và ghi rõ thông tin đến từ bạn hay phòng khám."],
  ["Your tracker is yours to update.", "記録を更新するのはあなたです。", "你的记录由你更新。", "Tú eres quien actualiza el registro.", "Bạn là người cập nhật danh sách này."],
  ["This tool can’t verify referral status, give medical advice, or determine insurance coverage. Confirm details with the relevant office or your health plan.", "このツールは紹介状況の確認、医療アドバイス、保険適用の判定を行いません。詳細は医療機関または保険会社に直接確認してください。", "此工具无法核实转诊状态、提供医疗建议或判定保险覆盖范围。请向相关诊所或保险计划确认详情。", "Esta herramienta no puede verificar el estado de la referencia, dar consejos médicos ni determinar la cobertura. Confirma los detalles con el consultorio o tu plan de salud.", "Công cụ này không thể xác minh trạng thái giới thiệu, tư vấn y tế hoặc xác định quyền lợi bảo hiểm. Hãy xác nhận với phòng khám hoặc chương trình bảo hiểm."],
  ["Referral Navigator · A personal referral companion", "Referral Navigator · 紹介状況を管理するツール", "Referral Navigator · 个人转诊助手", "Referral Navigator · Asistente personal de referencias", "Referral Navigator · Công cụ hỗ trợ theo dõi giới thiệu cá nhân"],
  ["REVIEW BEFORE YOU SEND", "送信前に確認", "发送前请审核", "REVISA ANTES DE ENVIAR", "XEM LẠI TRƯỚC KHI GỬI"],
  ["Prepare a call script or message", "電話用スクリプトまたはメッセージを作成", "准备电话提纲或信息", "Prepara un guion de llamada o mensaje", "Soạn kịch bản gọi điện hoặc tin nhắn"],
  ["Edit this draft for your situation. Nothing is sent from here.", "状況に合わせて下書きを編集してください。ここから送信されることはありません。", "请根据你的情况编辑草稿。此处不会发送任何内容。", "Adapta este borrador a tu situación. No se envía desde aquí.", "Chỉnh sửa bản nháp cho phù hợp. Nội dung sẽ không được gửi từ đây."],
  ["Call script", "電話用スクリプト", "电话提纲", "Guion de llamada", "Kịch bản gọi điện"],
  ["Call script draft", "電話用スクリプトの下書き", "电话提纲草稿", "Borrador de guion de llamada", "Bản nháp kịch bản gọi điện"],
  ["Portal message draft", "ポータルメッセージの下書き", "患者门户信息草稿", "Borrador de mensaje del portal", "Bản nháp tin nhắn trên cổng thông tin"],
  ["Email draft", "メールの下書き", "电子邮件草稿", "Borrador de correo electrónico", "Bản nháp email"],
  ["Portal message", "ポータルメッセージ", "患者门户信息", "Mensaje del portal", "Tin nhắn trên cổng thông tin"],
  ["Email", "メール", "电子邮件", "Correo electrónico", "Email"],
  ["Copied to clipboard", "クリップボードにコピーしました", "已复制到剪贴板", "Copiado al portapapeles", "Đã sao chép"],
  ["Copy draft to review", "下書きをコピー", "复制草稿", "Copiar borrador", "Sao chép bản nháp"],
  ["I contacted an office", "医療機関に連絡しました", "我联系了诊所", "Contacté a un consultorio", "Tôi đã liên hệ phòng khám"],
  ["You review and send it. Contact attempts are logged by you; they don’t confirm the referral was sent or received.", "内容を確認してから送信してください。連絡した記録はあなたが入力します。紹介状の送付や受領を確認するものではありません。", "请由你审核并发送。联系记录由你输入，但不代表转诊已发送或收到。", "Tú revisas y envías el mensaje. Tú registras los intentos de contacto; no confirman que se haya enviado o recibido la referencia.", "Bạn xem lại rồi tự gửi. Bạn tự ghi nhận lần liên hệ; điều này không xác nhận giấy giới thiệu đã được gửi hay nhận."],
  ["REFERRAL AGENT · PROTOTYPE", "紹介エージェント · プロトタイプ", "转诊助手 · 原型", "AGENTE DE REFERENCIAS · PROTOTIPO", "TRỢ LÝ GIỚI THIỆU · BẢN THỬ NGHIỆM"],
  ["SUGGESTED NEXT STEP", "次のステップの提案", "建议的下一步", "SIGUIENTE PASO SUGERIDO", "BƯỚC TIẾP THEO ĐƯỢC GỢI Ý"],
  ["Open referral action plan", "紹介の対応プランを開く", "查看转诊行动计划", "Abrir plan de acción de la referencia", "Mở kế hoạch xử lý giới thiệu"],
  ["Prepare a follow-up", "フォローアップを準備", "准备跟进", "Preparar seguimiento", "Chuẩn bị theo dõi"],
  ["Set a reminder", "リマインダーを設定", "设置提醒", "Programar un recordatorio", "Đặt lời nhắc"],
  ["Remind me on", "リマインド日", "提醒日期", "Recordarme el", "Nhắc tôi vào ngày"],
  ["Save reminder", "リマインダーを保存", "保存提醒", "Guardar recordatorio", "Lưu lời nhắc"],
  ["Why is the agent suggesting this?", "この提案の理由", "为什么助手会这样建议？", "¿Por qué el agente sugiere esto?", "Vì sao trợ lý đề xuất điều này?"],
  ["It uses only the referral details and updates you entered. It cannot check office systems, so confirm the next step with", "入力された紹介情報と更新内容のみを使用します。医療機関のシステムは確認できないため、次のステップを直接ご確認ください：", "它只使用你输入的转诊信息和更新内容。它无法查询诊所系统，请向以下机构确认下一步：", "Solo usa los datos y actualizaciones que ingresaste. No puede consultar los sistemas de los consultorios; confirma el siguiente paso con", "Công cụ chỉ dùng thông tin và cập nhật bạn nhập. Công cụ không thể kiểm tra hệ thống phòng khám; hãy xác nhận bước tiếp theo với"],
  ["Prototype suggestions use simple rules. They may miss context and do not contact offices or send messages.", "プロトタイプの提案は単純なルールに基づいており、状況を見落とすことがあります。医療機関への連絡やメッセージ送信は行いません。", "原型建议基于简单规则，可能遗漏背景信息；它不会联系诊所或发送信息。", "Las sugerencias del prototipo siguen reglas simples y pueden pasar por alto el contexto. No contacta consultorios ni envía mensajes.", "Gợi ý trong bản thử nghiệm dựa trên quy tắc đơn giản và có thể bỏ sót bối cảnh. Công cụ không liên hệ phòng khám hoặc gửi tin nhắn."],
  ["Specialist office confirmation recorded", "専門医療機関からの確認を記録しました", "已记录专科诊所确认", "Confirmación del consultorio especialista registrada", "Đã ghi nhận xác nhận từ phòng khám chuyên khoa"],
  ["Receipt update recorded", "受領に関する更新を記録しました", "已记录收件更新", "Se registró una actualización de recepción", "Đã ghi nhận cập nhật về việc tiếp nhận"],
  ["Waiting for receipt", "受領確認待ち", "等待确认收到", "Esperando confirmación de recepción", "Đang chờ xác nhận đã nhận"],
  ["Not confirmed yet", "まだ確認されていません", "尚未确认", "Aún no confirmado", "Chưa được xác nhận"],
  ["No additional notes.", "追加のメモはありません。", "没有其他备注。", "No hay notas adicionales.", "Không có ghi chú bổ sung."],
  ["Update added to your referral.", "紹介に更新を追加しました。", "已向转诊记录添加更新。", "Se añadió una actualización a tu referencia.", "Đã thêm cập nhật vào lượt giới thiệu."],
  ["You recorded a contact attempt. The referral status is still unconfirmed; add the office’s response when you have it.", "連絡したことを記録しました。紹介状況はまだ未確認です。医療機関から返答があれば追加してください。", "你记录了一次联系尝试。转诊状态仍未确认；收到诊所回复后请补充记录。", "Registraste un intento de contacto. El estado sigue sin confirmarse; añade la respuesta del consultorio cuando la tengas.", "Bạn đã ghi nhận lần liên hệ. Trạng thái giới thiệu vẫn chưa xác nhận; hãy thêm phản hồi của phòng khám khi có."],
  ["Contact attempt added to your activity. Referral status is unchanged.", "連絡履歴に追加しました。紹介状況は変わっていません。", "已添加联系记录。转诊状态未更改。", "Se añadió el intento de contacto a tu actividad. El estado de la referencia no cambió.", "Đã thêm lần liên hệ vào hoạt động. Trạng thái giới thiệu không thay đổi."],
  ["Follow-up reminder saved in this preview.", "このプレビューにリマインダーを保存しました。", "提醒已保存在此预览中。", "Recordatorio guardado en esta vista previa.", "Đã lưu lời nhắc trong bản xem trước này."],
  ["Draft copied. Review it before sending.", "下書きをコピーしました。送信前に確認してください。", "草稿已复制。发送前请审核。", "Borrador copiado. Revísalo antes de enviarlo.", "Đã sao chép bản nháp. Hãy xem lại trước khi gửi."],
  ["Referring office not added", "紹介元の医療機関が未入力です", "尚未添加转诊诊所", "No se añadió el consultorio que te refirió", "Chưa thêm nơi giới thiệu"],
  ["Specialist office not added", "専門医療機関が未入力です", "尚未添加专科诊所", "No se añadió el consultorio especialista", "Chưa thêm phòng khám chuyên khoa"],
  ["You added the details you had. The offices have not been contacted by this app.", "わかる範囲の情報を追加しました。このアプリが医療機関に連絡することはありません。", "你已添加现有信息。本应用不会联系任何诊所。", "Añadiste los datos que tenías. Esta aplicación no contactó a los consultorios.", "Bạn đã thêm thông tin hiện có. Ứng dụng không liên hệ với phòng khám."],
  ["Referral added.", "紹介を追加しました。", "已添加转诊。", "Referencia añadida.", "Đã thêm lượt giới thiệu."],
  ["All referrals", "すべての紹介", "所有转诊", "Todas las referencias", "Tất cả lượt giới thiệu"],
  ["Only you can update this tracker.", "この記録を更新できるのはあなたです。", "只有你可以更新此记录。", "Solo tú puedes actualizar este registro.", "Chỉ bạn mới có thể cập nhật danh sách này."],
  ["We can’t see referral status in office systems. Updates below are labeled by their source so you can tell what’s confirmed and what’s still unknown.", "医療機関のシステム上の紹介状況は確認できません。以下の更新には情報源が表示されるため、確認済みのことと不明なことを区別できます。", "我们无法查看诊所系统中的转诊状态。以下更新会标明来源，帮助你分辨已确认和未知的信息。", "No podemos ver el estado de la referencia en los sistemas de los consultorios. Las actualizaciones indican su fuente para distinguir lo confirmado de lo desconocido.", "Chúng tôi không thể xem trạng thái giới thiệu trong hệ thống phòng khám. Các cập nhật bên dưới ghi rõ nguồn để bạn biết điều gì đã xác nhận và điều gì chưa rõ."],
  ["THE HANDOFF", "紹介の流れ", "转诊流程", "EL PROCESO", "QUY TRÌNH GIỚI THIỆU"],
  ["From recommendation to appointment", "紹介の提案から予約まで", "从医生建议到预约", "De la recomendación a la cita", "Từ đề xuất đến cuộc hẹn"],
  ["+ Add update", "+ 更新を追加", "+ 添加更新", "+ Añadir actualización", "+ Thêm cập nhật"],
  ["Recorded", "記録済み", "已记录", "Registrado", "Đã ghi nhận"],
  ["Not confirmed", "未確認", "未确认", "No confirmado", "Chưa xác nhận"],
  ["Next", "次へ", "下一步", "Siguiente", "Tiếp theo"],
  ["YOUR NEXT STEP", "次のステップ", "你的下一步", "TU SIGUIENTE PASO", "BƯỚC TIẾP THEO"],
  ["Ask the referring office if it was sent", "紹介元に送付済みか確認する", "询问转诊诊所是否已发送", "Pregunta al consultorio que te refirió si la enviaron", "Hỏi nơi giới thiệu xem giấy đã được gửi chưa"],
  ["Ask the specialist office if it arrived", "専門医療機関に届いたか確認する", "询问专科诊所是否收到", "Pregunta al consultorio especialista si la recibió", "Hỏi phòng khám chuyên khoa xem đã nhận được chưa"],
  ["Prepare a call script", "電話用スクリプトを作成", "准备电话提纲", "Preparar un guion de llamada", "Soạn kịch bản gọi điện"],
  ["Draft a portal message", "ポータルメッセージを作成", "起草患者门户信息", "Redactar un mensaje del portal", "Soạn tin nhắn trên cổng thông tin"],
  ["YOUR ACTIVITY", "あなたの記録", "你的活动记录", "TU ACTIVIDAD", "HOẠT ĐỘNG CỦA BẠN"],
  ["Referral updates", "紹介の更新", "转诊更新", "Actualizaciones de la referencia", "Cập nhật giới thiệu"],
  ["You entered this", "あなたが入力", "由你输入", "Lo ingresaste tú", "Bạn đã nhập"],
  ["You recorded", "あなたが記録", "你记录了", "Lo registraste tú", "Bạn đã ghi nhận"],
  ["KEEP THINGS TOGETHER", "情報をまとめて管理", "集中管理信息", "TODO EN UN SOLO LUGAR", "TẬP HỢP THÔNG TIN"],
  ["Helpful details for your next call", "次の電話に役立つ情報", "为下次通话准备有用信息", "Información útil para tu próxima llamada", "Thông tin hữu ích cho cuộc gọi tiếp theo"],
  ["Keep questions and plan details in one place. This app doesn’t interpret diagnoses or determine coverage.", "質問や保険の詳細を一か所にまとめましょう。このアプリは診断の解釈や保険適用の判定を行いません。", "将问题和保险计划信息集中管理。本应用不会解读诊断或判定保险覆盖范围。", "Guarda preguntas y detalles del plan en un solo lugar. Esta aplicación no interpreta diagnósticos ni determina cobertura.", "Lưu câu hỏi và thông tin chương trình bảo hiểm ở một nơi. Ứng dụng không diễn giải chẩn đoán hoặc xác định quyền lợi."],
  ["Visit notes & questions", "診察メモと質問", "就诊备注和问题", "Notas y preguntas para la consulta", "Ghi chú và câu hỏi khi khám"],
  ["Notes saved", "メモを保存済み", "备注已保存", "Notas guardadas", "Đã lưu ghi chú"],
  ["Add what you want to remember", "覚えておきたいことを追加", "添加你想记住的内容", "Añade lo que quieras recordar", "Thêm điều bạn muốn ghi nhớ"],
  ["Coverage questions", "保険についての質問", "保险问题", "Preguntas sobre cobertura", "Câu hỏi về bảo hiểm"],
  ["What to ask your health plan", "保険会社に確認すること", "向保险计划咨询的问题", "Qué preguntarle a tu plan de salud", "Điều cần hỏi chương trình bảo hiểm"],
  ["Referral Navigator helps you organize information you provide. It can’t verify referral status, give medical advice, or determine insurance coverage. This preview keeps edits in memory; refreshing clears them.", "Referral Navigator は、あなたが入力した情報を整理します。紹介状況の確認、医療アドバイス、保険適用の判定はできません。このプレビューの編集内容は一時保存で、更新すると消去されます。", "Referral Navigator 帮你整理所提供的信息，但无法核实转诊状态、提供医疗建议或判定保险覆盖。此预览中的更改仅暂存，刷新后会清除。", "Referral Navigator organiza la información que proporcionas. No puede verificar referencias, dar consejos médicos ni determinar cobertura. Los cambios de esta vista previa se borran al actualizar.", "Referral Navigator giúp bạn sắp xếp thông tin đã cung cấp. Công cụ không thể xác minh trạng thái, tư vấn y tế hoặc xác định quyền lợi bảo hiểm. Các chỉnh sửa trong bản xem trước sẽ mất khi tải lại."],
  ["Record an update", "更新を記録", "记录更新", "Registrar una actualización", "Ghi nhận cập nhật"],
  ["A little guidance", "簡単なガイド", "使用提示", "Una pequeña guía", "Hướng dẫn nhanh"],
  ["e.g. Called to ask if referral was sent", "例：紹介状が送付されたか電話で確認", "例如：致电询问是否已发送转诊", "Ej.: Llamé para preguntar si enviaron la referencia", "Ví dụ: Gọi hỏi giấy giới thiệu đã được gửi chưa"],
  ["What did they tell you? Include a name or reference number if useful.", "どのような説明を受けましたか？必要であれば担当者名や受付番号も記録してください。", "对方怎么说？如有帮助，可记录姓名或编号。", "¿Qué te dijeron? Incluye un nombre o número de referencia si te sirve.", "Họ đã nói gì? Có thể ghi tên hoặc mã tham chiếu nếu hữu ích."],
  ["Your notes were saved.", "メモを保存しました。", "备注已保存。", "Tus notas se guardaron.", "Đã lưu ghi chú của bạn."],
  ["Add what you know after a clinician recommends specialist care. You can fill in the rest later.", "専門医療を勧められた後、わかる情報を追加してください。残りは後から入力できます。", "医生建议专科护理后，先添加你知道的信息。其他内容可稍后补充。", "Después de que un profesional te recomiende atención especializada, añade lo que sabes. Puedes completar el resto más tarde.", "Sau khi bác sĩ đề xuất chăm sóc chuyên khoa, hãy thêm thông tin bạn biết. Bạn có thể bổ sung sau."],
  ["Specialty or reason", "専門分野または理由", "专科或原因", "Especialidad o motivo", "Chuyên khoa hoặc lý do"],
  ["Referring office", "紹介元の医療機関", "转诊诊所", "Consultorio que te refirió", "Nơi giới thiệu"],
  ["Specialist office", "専門医療機関", "专科诊所", "Consultorio especialista", "Phòng khám chuyên khoa"],
  ["Date recommended", "紹介を勧められた日", "建议转诊日期", "Fecha de la recomendación", "Ngày được đề xuất"],
  ["Adding a referral only saves it in your tracker. Nothing is sent to an office.", "紹介を追加すると記録に保存されます。医療機関に送信されることはありません。", "添加转诊只会保存到你的记录中，不会发送给诊所。", "Añadir una referencia solo la guarda en tu registro. No se envía nada a ningún consultorio.", "Thêm lượt giới thiệu chỉ lưu vào danh sách. Không có thông tin nào được gửi đến phòng khám."],
  ["Add to my referrals", "紹介一覧に追加", "添加到我的转诊", "Añadir a mis referencias", "Thêm vào danh sách của tôi"],
  ["Keep track of what you heard and who it came from. This records your note; it doesn’t contact an office.", "聞いた内容と情報源を記録します。メモを保存するだけで、医療機関への連絡は行いません。", "记录你听到的内容及来源。这只会保存备注，不会联系诊所。", "Registra lo que escuchaste y quién te lo dijo. Esto guarda tu nota; no contacta al consultorio.", "Ghi lại điều bạn được thông báo và nguồn tin. Thao tác này chỉ lưu ghi chú, không liên hệ phòng khám."],
  ["What happened?", "何がありましたか？", "发生了什么？", "¿Qué pasó?", "Điều gì đã xảy ra?"],
  ["What part of the handoff is this about?", "紹介のどの段階についてですか？", "这条更新属于转诊流程的哪个环节？", "¿A qué parte del proceso se refiere?", "Thông tin này liên quan đến bước nào?"],
  ["General update", "一般的な更新", "一般更新", "Actualización general", "Cập nhật chung"],
  ["Referral received", "紹介状を受領", "已收到转诊", "Referencia recibida", "Đã nhận giấy giới thiệu"],
  ["Ready to schedule", "予約可能", "可以预约", "Listo para programar", "Sẵn sàng đặt lịch"],
  ["Who provided this update?", "この情報を伝えたのは誰ですか？", "谁提供了这条更新？", "¿Quién proporcionó esta actualización?", "Ai cung cấp thông tin cập nhật này?"],
  ["You", "あなた", "你", "Tú", "Bạn"],
  ["Referring office", "紹介元の医療機関", "转诊诊所", "Consultorio que te refirió", "Nơi giới thiệu"],
  ["Specialist office", "専門医療機関", "专科诊所", "Consultorio especialista", "Phòng khám chuyên khoa"],
  ["Health plan", "保険プラン", "保险计划", "Plan de salud", "Chương trình bảo hiểm"],
  ["Notes", "メモ", "备注", "Notas", "Ghi chú"],
  ["Office updates mean you recorded what an office told you; Referral Navigator doesn’t verify them.", "医療機関からの更新は、あなたが聞いた内容を記録したものです。Referral Navigator が確認した情報ではありません。", "诊所更新表示你记录了诊所告知的内容；Referral Navigator 不会核实这些信息。", "Las actualizaciones de consultorios reflejan lo que te dijeron; Referral Navigator no las verifica.", "Cập nhật từ phòng khám là thông tin bạn ghi lại; Referral Navigator không xác minh chúng."],
  ["Save update", "更新を保存", "保存更新", "Guardar actualización", "Lưu cập nhật"],
  ["Referral Navigator is your personal organizer. It doesn’t connect to clinic or insurance systems.", "Referral Navigator は個人用の整理ツールです。医療機関や保険のシステムには接続しません。", "Referral Navigator 是你的个人整理工具，不会连接诊所或保险系统。", "Referral Navigator es tu organizador personal. No se conecta a sistemas clínicos ni de seguros.", "Referral Navigator là công cụ sắp xếp cá nhân. Công cụ không kết nối với hệ thống phòng khám hoặc bảo hiểm."],
  ["Ask the referring office", "紹介元の医療機関に確認", "询问转诊诊所", "Pregunta al consultorio que te refirió", "Hỏi nơi giới thiệu"],
  ["Was the referral sent? When, and to which specialist?", "紹介状は送付されましたか？いつ、どの専門医に送られましたか？", "转诊是否已发送？何时发送给哪位专科医生？", "¿Se envió la referencia? ¿Cuándo y a qué especialista?", "Giấy giới thiệu đã được gửi chưa? Khi nào và đến bác sĩ nào?"],
  ["Ask the specialist office", "専門医療機関に確認", "询问专科诊所", "Pregunta al consultorio especialista", "Hỏi phòng khám chuyên khoa"],
  ["Did it arrive? Is anything else needed before scheduling?", "届いていますか？予約前に必要なものはありますか？", "收到了吗？预约前还需要其他资料吗？", "¿La recibieron? ¿Necesitan algo más antes de programar?", "Họ đã nhận được chưa? Có cần thêm gì trước khi đặt lịch không?"],
  ["Check with your health plan", "保険会社に確認", "向保险计划确认", "Consulta con tu plan de salud", "Kiểm tra với chương trình bảo hiểm"],
  ["Is the specialist in network? Is authorization required?", "専門医はネットワーク内ですか？事前承認は必要ですか？", "该专科医生在网络内吗？是否需要事先授权？", "¿El especialista está dentro de la red? ¿Se requiere autorización?", "Bác sĩ chuyên khoa có trong mạng lưới không? Có cần phê duyệt trước không?"],
  ["Coverage and appointment rules vary. Confirm details directly with the office or plan.", "保険適用や予約のルールは異なります。医療機関または保険会社に直接確認してください。", "保险覆盖和预约规则各不相同，请直接向诊所或保险计划确认。", "La cobertura y las reglas para citas varían. Confirma los detalles con el consultorio o el plan.", "Quyền lợi bảo hiểm và quy định đặt lịch khác nhau. Hãy xác nhận trực tiếp với phòng khám hoặc chương trình bảo hiểm."],
  ["Got it", "わかりました", "知道了", "Entendido", "Đã hiểu"],
  ["Save your own visit recap or questions for your next conversation. This tool won’t interpret symptoms or recommend treatment.", "診察のまとめや次回聞きたい質問を保存できます。このツールは症状を解釈したり治療を勧めたりしません。", "保存就诊摘要或下次想问的问题。本工具不会解读症状或推荐治疗。", "Guarda tu resumen de la consulta o preguntas para la próxima conversación. Esta herramienta no interpreta síntomas ni recomienda tratamientos.", "Lưu tóm tắt buổi khám hoặc câu hỏi cho lần trao đổi tiếp theo. Công cụ không diễn giải triệu chứng hoặc đề xuất điều trị."],
  ["Save notes", "メモを保存", "保存备注", "Guardar notas", "Lưu ghi chú"],
  ["What did your clinician recommend? What would you like to ask next time?", "担当医は何を勧めましたか？次回聞きたいことは何ですか？", "医生建议了什么？下次你想问什么？", "¿Qué te recomendó tu profesional de salud? ¿Qué te gustaría preguntar la próxima vez?", "Bác sĩ đã đề xuất gì? Bạn muốn hỏi điều gì vào lần tới?"],
  ["YOUR SPACE", "あなたのスペース", "你的空间", "TU ESPACIO", "KHÔNG GIAN CỦA BẠN"],
  ["Overview", "概要", "概览", "Resumen", "Tổng quan"],
  ["Next steps", "次のステップ", "下一步", "Próximos pasos", "Bước tiếp theo"],
  ["YOUR CARE, ORGANIZED", "あなたのケアを整理", "整理你的就医信息", "TU ATENCIÓN, ORGANIZADA", "SẮP XẾP VIỆC CHĂM SÓC"],
  ["Know what you’ve heard, what’s still unclear, and who to contact next.", "聞いた内容、まだ不明なこと、次に連絡する相手を整理できます。", "了解已获知的信息、尚不清楚的事项，以及下一步该联系谁。", "Ten claro lo que te dijeron, lo que falta por aclarar y a quién contactar después.", "Nắm rõ thông tin đã nghe, điều còn chưa rõ và người cần liên hệ tiếp theo."],
  ["Sample referral", "サンプル紹介", "示例转诊", "Referencia de ejemplo", "Lượt giới thiệu mẫu"],
  ["Explore the tracker, then start your own when you’re ready.", "記録を見て、準備ができたら自分の紹介を追加しましょう。", "先查看示例记录，准备好后再添加自己的转诊。", "Explora el registro y crea el tuyo cuando estés listo.", "Xem thử danh sách rồi tạo mục của bạn khi sẵn sàng."],
  ["Start your own", "自分の紹介を始める", "开始记录自己的转诊", "Crear mi registro", "Bắt đầu danh sách của bạn"],
  ["IN YOUR TRACKER", "記録中", "记录中的转诊", "EN TU REGISTRO", "TRONG DANH SÁCH"],
  ["Referral summary", "紹介の概要", "转诊摘要", "Resumen de referencias", "Tóm tắt giới thiệu"],
  ["FOLLOW-UP", "フォローアップ", "后续跟进", "SEGUIMIENTO", "THEO DÕI"],
  ["Without a scheduling update", "予約に関する更新なし", "尚无预约更新", "Sin actualización de programación", "Chưa có cập nhật đặt lịch"],
  ["RECEIPT CONFIRMED", "受領確認済み", "已确认收到", "RECEPCIÓN CONFIRMADA", "ĐÃ XÁC NHẬN TIẾP NHẬN"],
  ["Specialist office updates", "専門医療機関からの更新", "专科诊所更新", "Actualizaciones del consultorio especialista", "Cập nhật từ phòng khám chuyên khoa"],
  ["READY TO SCHEDULE", "予約可能", "可以预约", "LISTO PARA PROGRAMAR", "SẴN SÀNG ĐẶT LỊCH"],
  ["Based on updates you recorded", "あなたが記録した更新に基づく", "根据你记录的更新", "Según las actualizaciones que registraste", "Dựa trên thông tin cập nhật bạn đã ghi"],
  ["Your referrals", "あなたの紹介", "你的转诊", "Tus referencias", "Lượt giới thiệu của bạn"],
  ["Updates are entered by you and labeled by source.", "更新はあなたが入力し、情報源が表示されます。", "更新由你输入，并标明来源。", "Tú ingresas las actualizaciones y se indica su fuente.", "Bạn tự nhập cập nhật và thông tin sẽ ghi rõ nguồn."],
  ["No referrals yet", "紹介はまだありません", "尚无转诊", "Aún no tienes referencias", "Chưa có lượt giới thiệu"],
  ["Add a referral to keep the next steps and office details together.", "紹介を追加して、次のステップと医療機関の情報をまとめましょう。", "添加转诊，以便集中管理下一步和诊所信息。", "Añade una referencia para reunir los siguientes pasos y los datos del consultorio.", "Thêm lượt giới thiệu để tập hợp bước tiếp theo và thông tin phòng khám."],
  ["Add your first referral", "最初の紹介を追加", "添加你的第一项转诊", "Añadir mi primera referencia", "Thêm lượt giới thiệu đầu tiên"],
  ["Added", "追加日", "添加于", "Añadido", "Đã thêm"],
  ["updates", "件の更新", "条更新", "actualizaciones", "cập nhật"],
  ["Prepare a call script", "電話用スクリプトを作成", "准备电话提纲", "Preparar un guion de llamada", "Soạn kịch bản gọi điện"],
  ["View full referral", "紹介の詳細を見る", "查看完整转诊", "Ver referencia completa", "Xem chi tiết lượt giới thiệu"],
  ["Schedule your appointment", "予約を取る", "预约就诊", "Programa tu cita", "Đặt lịch hẹn"],
  ["Confirm it with the specialist", "専門医療機関に確認", "向专科诊所确认", "Confírmalo con el especialista", "Xác nhận với bác sĩ chuyên khoa"],
  ["Check that it arrived", "届いたか確認", "确认对方已收到", "Confirma que llegó", "Kiểm tra đã nhận được chưa"],
  ["You recorded that the specialist office confirmed receipt. Ask what to do next to schedule.", "専門医療機関が受領したと記録しました。次に予約する方法を確認しましょう。", "你记录了专科诊所已收到。请询问接下来如何预约。", "Registraste que el consultorio especialista confirmó la recepción. Pregunta cómo programar la cita.", "Bạn đã ghi nhận phòng khám chuyên khoa xác nhận đã nhận. Hãy hỏi bước tiếp theo để đặt lịch."],
  ["Specialist confirmation recorded", "専門医療機関の確認を記録しました", "已记录专科诊所确认", "Confirmación del especialista registrada", "Đã ghi nhận xác nhận từ chuyên khoa"],
  ["You recorded a receipt update. Check the source in your timeline.", "受領に関する更新を記録しました。タイムラインで情報源を確認してください。", "你记录了收件更新。请在时间线上查看来源。", "Registraste una actualización de recepción. Consulta su fuente en la cronología.", "Bạn đã ghi nhận cập nhật tiếp nhận. Hãy xem nguồn trong dòng thời gian."],
  ["You recorded that the referring office sent it. Receipt is still unknown.", "紹介元が送付したと記録しました。受領状況はまだ不明です。", "你记录了转诊诊所已发送，但是否收到仍未知。", "Registraste que el consultorio que te refirió la envió. Aún no se sabe si la recibieron.", "Bạn đã ghi nhận nơi giới thiệu đã gửi. Việc tiếp nhận vẫn chưa rõ."],
  ["Referral sending and receipt haven’t been confirmed yet.", "紹介状の送付と受領はまだ確認されていません。", "转诊发送和接收情况尚未确认。", "Aún no se confirmó el envío ni la recepción de la referencia.", "Việc gửi và nhận giấy giới thiệu vẫn chưa được xác nhận."],
  ["Add your first referral", "最初の紹介を追加", "添加你的第一项转诊", "Añadir mi primera referencia", "Thêm lượt giới thiệu đầu tiên"],
  ["Start with what your clinician recommended. You can fill in office details later.", "担当医の提案から始めましょう。医療機関の詳細は後から追加できます。", "先记录医生的建议，诊所信息之后可以补充。", "Empieza con la recomendación de tu profesional de salud. Puedes añadir los datos del consultorio después.", "Bắt đầu với đề xuất của bác sĩ. Bạn có thể bổ sung thông tin phòng khám sau."],
  ["Open referral", "紹介を開く", "打开转诊", "Abrir referencia", "Mở lượt giới thiệu"],
  ["Based on your saved updates", "保存した更新に基づく", "根据你保存的更新", "Según tus actualizaciones guardadas", "Dựa trên cập nhật đã lưu"],
  ["RECENT ACTIVITY", "最近のアクティビティ", "近期活动", "ACTIVIDAD RECIENTE", "HOẠT ĐỘNG GẦN ĐÂY"],
  ["Your saved updates will appear here.", "保存した更新がここに表示されます。", "保存的更新会显示在这里。", "Tus actualizaciones guardadas aparecerán aquí.", "Cập nhật đã lưu sẽ xuất hiện ở đây."],
  ["Questions to take with you", "次回持っていく質問", "下次要询问的问题", "Preguntas para llevar", "Câu hỏi cần ghi nhớ"],
  ["Ask the referring office whether and when the referral was sent.", "紹介元に、紹介状が送付されたか、いつ送付されたか確認しましょう。", "询问转诊诊所是否已发送以及何时发送。", "Pregunta al consultorio que te refirió si enviaron la referencia y cuándo.", "Hỏi nơi giới thiệu giấy đã được gửi chưa và khi nào."],
  ["Check with the specialist office that it arrived.", "専門医療機関に届いたか確認しましょう。", "向专科诊所确认是否收到。", "Confirma con el consultorio especialista que la recibió.", "Hỏi phòng khám chuyên khoa xem đã nhận được chưa."],
  ["Ask your health plan about network and authorization requirements.", "保険会社にネットワークと事前承認の要件を確認しましょう。", "询问保险计划有关网络和授权要求。", "Consulta con tu plan de salud los requisitos de red y autorización.", "Hỏi chương trình bảo hiểm về mạng lưới và yêu cầu phê duyệt."],
  ["Review the steps", "手順を確認", "查看步骤", "Revisar los pasos", "Xem lại các bước"],
  ["Patient-owned, with no automatic status checks", "患者が管理し、自動の状況確認はありません", "由患者管理，不会自动查询状态", "Controlado por el paciente, sin verificaciones automáticas", "Bệnh nhân tự quản lý, không tự động kiểm tra trạng thái"],
  ["Changes in this preview stay in memory and reset on refresh. Referral Navigator doesn’t contact offices or access their systems.", "このプレビューの変更は一時保存され、更新するとリセットされます。Referral Navigator は医療機関に連絡したり、システムにアクセスしたりしません。", "此预览中的更改仅暂存在内存中，刷新后会重置。Referral Navigator 不会联系诊所或访问其系统。", "Los cambios de esta vista previa se guardan temporalmente y se reinician al actualizar. Referral Navigator no contacta consultorios ni accede a sus sistemas.", "Thay đổi trong bản xem trước chỉ lưu tạm và sẽ đặt lại khi tải lại. Referral Navigator không liên hệ hoặc truy cập hệ thống phòng khám."],
  ["About this tool", "このツールについて", "关于此工具", "Acerca de esta herramienta", "Giới thiệu công cụ"],
  ["Referral Navigator is your personal organizer. It doesn’t connect to clinic or insurance systems.", "Referral Navigator は個人用の整理ツールです。医療機関や保険のシステムには接続しません。", "Referral Navigator 是你的个人整理工具，不会连接诊所或保险系统。", "Referral Navigator es tu organizador personal. No se conecta a sistemas clínicos ni de seguros.", "Referral Navigator là công cụ sắp xếp cá nhân. Công cụ không kết nối hệ thống phòng khám hoặc bảo hiểm."],
  ["REVIEW BEFORE YOU SEND", "送信前に確認", "发送前请审核", "REVISA ANTES DE ENVIAR", "XEM LẠI TRƯỚC KHI GỬI"],
  ["Prepare a call script or message", "電話用スクリプトまたはメッセージを作成", "准备电话提纲或信息", "Prepara un guion de llamada o mensaje", "Soạn kịch bản gọi điện hoặc tin nhắn"],
  ["e.g. Cardiology", "例：循環器科", "例如：心脏科", "Ej.: Cardiología", "Ví dụ: Tim mạch"],
  ["Clinic or clinician name", "医療機関または担当者名", "诊所或临床医生姓名", "Nombre del consultorio o profesional", "Tên phòng khám hoặc bác sĩ"],
  ["If you know it", "わかる場合", "如已知", "Si lo sabes", "Nếu bạn biết"],
  ["Oral surgery", "口腔外科", "口腔外科", "Cirugía oral", "Phẫu thuật miệng"],
  ["A clinician suggests specialist care", "担当医が専門医療を提案", "临床医生建议专科护理", "Un profesional recomienda atención especializada", "Bác sĩ đề xuất chăm sóc chuyên khoa"],
  ["Referral sent", "紹介状を送付", "已发送转诊", "Referencia enviada", "Đã gửi giấy giới thiệu"],
  ["Check with the specialist’s office", "専門医療機関に確認", "向专科诊所确认", "Consulta con el consultorio especialista", "Kiểm tra với phòng khám chuyên khoa"],
  ["Receipt confirmed", "受領確認済み", "已确认收到", "Recepción confirmada", "Đã xác nhận tiếp nhận"],
  ["Ask how to book your visit", "予約方法を確認", "询问如何预约", "Pregunta cómo programar tu cita", "Hỏi cách đặt lịch khám"],
  ["Next step", "次のステップ", "下一步", "Siguiente paso", "Bước tiếp theo"],
  ["Referral sending is not confirmed yet.", "紹介状の送付はまだ確認されていません。", "转诊是否发送尚未确认。", "Aún no se confirmó el envío de la referencia.", "Việc gửi giấy giới thiệu vẫn chưa được xác nhận."],
  ["There is no referral-sent update in your tracker.", "記録に紹介状の送付に関する更新はありません。", "你的记录中没有转诊已发送的更新。", "No hay una actualización sobre el envío en tu registro.", "Danh sách chưa có cập nhật về việc gửi giấy giới thiệu."],
  ["Your tracker does not include a sent confirmation.", "記録には送付確認がありません。", "你的记录中没有发送确认。", "Tu registro no incluye confirmación de envío.", "Danh sách chưa có xác nhận đã gửi."],
  ["Receipt still needs confirmation.", "受領の確認が必要です。", "仍需确认是否收到。", "Aún hace falta confirmar la recepción.", "Vẫn cần xác nhận đã nhận."],
  ["Your tracker says the referral was sent, but it does not include confirmation from the specialist office.", "紹介状は送付済みと記録されていますが、専門医療機関からの受領確認はありません。", "你的记录显示转诊已发送，但没有专科诊所的收件确认。", "Tu registro indica que se envió la referencia, pero no incluye confirmación del consultorio especialista.", "Danh sách ghi giấy đã gửi nhưng chưa có xác nhận từ phòng khám chuyên khoa."],
  ["The referral-sent update is recorded, but no specialist-office receipt update is recorded.", "送付に関する更新は記録されていますが、専門医療機関の受領に関する更新はありません。", "已记录转诊发送，但尚未记录专科诊所收件。", "Se registró el envío, pero no la recepción por parte del consultorio especialista.", "Đã ghi nhận việc gửi nhưng chưa có cập nhật phòng khám chuyên khoa đã nhận."],
  ["Ask what is needed before scheduling.", "予約前に必要なものを確認してください。", "询问预约前还需要什么。", "Pregunta qué hace falta antes de programar.", "Hỏi xem cần gì trước khi đặt lịch."],
  ["You recorded that the specialist office received the referral.", "専門医療機関が紹介状を受領したと記録しました。", "你记录了专科诊所已收到转诊。", "Registraste que el consultorio especialista recibió la referencia.", "Bạn đã ghi nhận phòng khám chuyên khoa đã nhận giấy giới thiệu."],
  ["Your latest recorded handoff milestone is receipt.", "最新の引き継ぎ状況は受領です。", "你最近记录的转诊环节是已收到。", "El último paso que registraste es la recepción.", "Bước bàn giao gần nhất bạn ghi nhận là đã tiếp nhận."],
  ["Your tracker says the referral is ready for scheduling.", "記録では予約可能となっています。", "你的记录显示可以预约。", "Tu registro indica que ya se puede programar.", "Danh sách ghi rằng đã sẵn sàng đặt lịch."],
  ["You recorded that the office said the referral is ready.", "医療機関から予約可能と聞いたことを記録しました。", "你记录了诊所告知转诊已可预约。", "Registraste que el consultorio indicó que ya está lista.", "Bạn đã ghi nhận phòng khám cho biết có thể đặt lịch."],
  ["This is based on the ready-to-schedule update you recorded.", "あなたが記録した「予約可能」の更新に基づいています。", "此建议基于你记录的“可以预约”更新。", "Esto se basa en la actualización de que ya se puede programar.", "Điều này dựa trên cập nhật sẵn sàng đặt lịch mà bạn đã ghi."],
  ["Check whether it was sent", "送付されたか確認", "确认是否已发送", "Confirma si la enviaron", "Kiểm tra giấy đã được gửi chưa"],
  ["Confirm it arrived", "届いたか確認", "确认是否收到", "Confirma que llegó", "Xác nhận đã nhận"],
  ["Review your latest update", "最新の更新を確認", "查看最近的更新", "Revisa tu actualización más reciente", "Xem cập nhật gần nhất"],
  ["Open your referral tracker to see what you recorded and decide what comes next.", "紹介の記録を開いて入力内容を確認し、次のステップを決めましょう。", "打开转诊记录查看已记录的信息，并决定下一步。", "Abre tu registro para revisar lo que anotaste y decidir qué sigue.", "Mở danh sách để xem thông tin đã ghi và quyết định bước tiếp theo."],
  ["Referral Agent recommendation", "Referral Agent の提案", "Referral Agent 建议", "Recomendación del Agente de Referencias", "Đề xuất của Referral Agent"],
  ["Review your follow-up draft", "フォローアップの下書きを確認", "查看跟进草稿", "Revisa el borrador de seguimiento", "Xem lại bản nháp theo dõi"],
  ["Close draft", "下書きを閉じる", "关闭草稿", "Cerrar borrador", "Đóng bản nháp"],
  ["the requested item", "依頼された資料", "所需材料", "el documento solicitado", "tài liệu được yêu cầu"],
  ["e.g. Called to ask if referral was sent", "例：紹介状が送付されたか電話で確認", "例如：致电询问是否已发送转诊", "Ej.: Llamé para preguntar si enviaron la referencia", "Ví dụ: Gọi hỏi giấy giới thiệu đã được gửi chưa"],
  ["Updates are entered by you; referral status isn’t checked automatically.", "更新はあなたが入力します。紹介状況は自動では確認されません。", "更新由你输入；系统不会自动查询转诊状态。", "Tú ingresas las actualizaciones; el estado de la referencia no se verifica automáticamente.", "Bạn tự nhập cập nhật; trạng thái giới thiệu không được tự động kiểm tra."],
  ["Keep your referral moving.", "紹介を前に進めましょう。", "让转诊继续推进。", "Mantén en marcha tu referencia.", "Giúp lượt giới thiệu tiếp tục tiến triển."],
  ["Record a response or update", "返答や更新を記録", "记录回复或更新", "Registrar una respuesta o actualización", "Ghi nhận phản hồi hoặc cập nhật"],
  ["Was the referral sent? When and to which specialist?", "紹介状は送付されましたか？いつ、どの専門医に送られましたか？", "转诊是否已发送？何时发送给哪位专科医生？", "¿Se envió la referencia? ¿Cuándo y a qué especialista?", "Giấy giới thiệu đã được gửi chưa? Khi nào và đến bác sĩ nào?"],
  ["Referral", "紹介", "转诊", "Referencia", "Giới thiệu"],
  ["you added", "あなたが追加", "由你添加", "que agregaste", "bạn đã thêm"],
  ["Specialist recommended", "専門医を勧められた", "医生建议看专科", "Especialista recomendado", "Được đề xuất khám chuyên khoa"],
  ["A patient-owned referral companion", "患者が自分で管理する紹介サポートツール", "由患者自主使用的转诊助手", "Un asistente de referencias controlado por el paciente", "Công cụ theo dõi giới thiệu do bệnh nhân tự quản lý"],
  ["Sample tracker", "サンプルの紹介記録", "示例转诊记录", "Registro de ejemplo", "Danh sách mẫu"],
  ["Specialist office noted a missing item", "専門医療機関から不足している資料について連絡がありました", "专科诊所表示缺少一项资料", "El consultorio especialista indicó que falta un documento", "Phòng khám chuyên khoa cho biết còn thiếu tài liệu"],
  ["You recorded that the specialist office confirmed receipt.", "専門医療機関が受領を確認したと記録しました。", "你记录了专科诊所已确认收到。", "Registraste que el consultorio especialista confirmó la recepción.", "Bạn đã ghi nhận phòng khám chuyên khoa xác nhận đã nhận."],
  ["You recorded a receipt update. Check the source in your timeline.", "受領に関する更新を記録しました。タイムラインで情報源を確認してください。", "你记录了收件更新。请在时间线上查看来源。", "Registraste una actualización de recepción. Consulta su fuente en la cronología.", "Bạn đã ghi nhận cập nhật tiếp nhận. Hãy xem nguồn trong dòng thời gian."],
  ["KEEP IN MIND", "覚えておくこと", "请记住", "A TENER EN CUENTA", "CẦN LƯU Ý"],
  ["submit", "送信", "提交", "Enviar", "Gửi"],
];

const dictionary = Object.fromEntries(
  rows.map(([source, ja, zh, es, vi]) => [source, { ja, zh, es, vi }]),
) as Record<string, Partial<Record<Exclude<AppLanguage, "en">, string>>>;

function preserveWhitespace(source: string, translated: string) {
  const leading = source.match(/^\s*/)?.[0] ?? "";
  const trailing = source.match(/\s*$/)?.[0] ?? "";
  return leading + translated + trailing;
}

function formatEnglishDate(source: string, language: AppLanguage) {
  const match = source.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) return null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = new Date(Number(match[3]), months.indexOf(match[1]), Number(match[2]));
  return new Intl.DateTimeFormat(languageLocales[language], { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function translateText(source: string, language: AppLanguage): string {
  if (language === "en") return source;
  const clean = source.replace(/\s+/g, " ").trim();
  const exact = dictionary[clean]?.[language];
  if (exact) return preserveWhitespace(source, exact);

  const date = formatEnglishDate(clean, language);
  if (date) return preserveWhitespace(source, date);

  const reminder = clean.match(/^Follow-up reminder saved for (.+)$/);
  if (reminder) {
    const dateText = translateText(reminder[1], language);
    const localized = {
      ja: `${dateText}にフォローアップのリマインダーを保存しました`,
      zh: `已保存${dateText}的跟进提醒`,
      es: `Recordatorio de seguimiento guardado para el ${dateText}`,
      vi: `Đã lưu lời nhắc theo dõi vào ngày ${dateText}`,
    }[language];
    return preserveWhitespace(source, localized);
  }

  const contacted = clean.match(/^You contacted (.+)$/);
  if (contacted) {
    return preserveWhitespace(source, {
      ja: `${contacted[1]}に連絡しました`,
      zh: `你联系了${contacted[1]}`,
      es: `Contactaste a ${contacted[1]}`,
      vi: `Bạn đã liên hệ ${contacted[1]}`,
    }[language]);
  }
  return source;
}

type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void };
const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const maps = useRef({
    originals: new WeakMap<Text, string>(),
    rendered: new WeakMap<Text, string>(),
    attributeOriginals: new WeakMap<Element, Map<string, string>>(),
    attributeRendered: new WeakMap<Element, Map<string, string>>(),
  });
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem("referral-navigator-language");
      return saved === "ja" || saved === "zh" || saved === "es" || saved === "vi" ? saved : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    const { originals, rendered, attributeOriginals, attributeRendered } = maps.current;

    const applyText = (node: Text) => {
      const current = node.data;
      const previousRendered = rendered.get(node);
      let original = originals.get(node);
      if (original === undefined || (previousRendered !== undefined && current !== previousRendered)) {
        original = current;
        originals.set(node, original);
      } else if (previousRendered === undefined) {
        original = current;
        originals.set(node, original);
      }
      const next = translateText(original, language);
      rendered.set(node, next);
      if (current !== next) node.data = next;
    };

    const attributes = ["aria-label", "title", "placeholder"];
    const applyAttributes = (element: Element) => {
      if (element.closest("[data-no-translate]")) return;
      for (const attribute of attributes) {
        const value = element.getAttribute(attribute);
        if (value === null) continue;
        let originalsForElement = attributeOriginals.get(element);
        let renderedForElement = attributeRendered.get(element);
        if (!originalsForElement) {
          originalsForElement = new Map();
          attributeOriginals.set(element, originalsForElement);
        }
        if (!renderedForElement) {
          renderedForElement = new Map();
          attributeRendered.set(element, renderedForElement);
        }
        const previous = renderedForElement.get(attribute);
        let original = originalsForElement.get(attribute);
        if (original === undefined || (previous !== undefined && value !== previous)) {
          original = value;
          originalsForElement.set(attribute, original);
        }
        const next = translateText(original, language);
        renderedForElement.set(attribute, next);
        if (value !== next) element.setAttribute(attribute, next);
      }
    };

    const scan = (root: ParentNode) => {
      if (root instanceof Element) applyAttributes(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style, textarea, [data-no-translate]")) continue;
        applyText(node as Text);
      }
      if ("querySelectorAll" in root) {
        (root as ParentNode & { querySelectorAll: (selectors: string) => NodeListOf<Element> })
          .querySelectorAll("[aria-label], [title], [placeholder]")
          .forEach(applyAttributes);
      }
    };

    document.documentElement.lang = languageLocales[language];
    scan(document.body);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData" && record.target instanceof Text) applyText(record.target);
        record.addedNodes.forEach((node) => {
          if (node instanceof Text) applyText(node);
          else if (node instanceof Element || node instanceof DocumentFragment) scan(node);
        });
        if (record.type === "attributes" && record.target instanceof Element) applyAttributes(record.target);
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributes,
    });
    return () => observer.disconnect();
  }, [language]);

  const setLanguage = (next: AppLanguage) => {
    setLanguageState(next);
    try {
      localStorage.setItem("referral-navigator-language", next);
    } catch {
      // Language choice still applies for this session.
    }
  };

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle() {
  const { language, setLanguage } = useAppLanguage();
  return (
    <label className="language-toggle">
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        value={language}
        onChange={(event) => setLanguage(event.target.value as AppLanguage)}
      >
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="zh">中文</option>
        <option value="es">Español</option>
        <option value="vi">Tiếng Việt</option>
      </select>
    </label>
  );
}

export function localizedDraft(
  language: AppLanguage,
  kind: "Call script" | "Portal message" | "Email",
  recipient: string,
  specialty: string,
  question: string,
) {
  if (language === "en") {
    return kind === "Call script"
      ? `Hello, my name is [your name]. I’m calling ${recipient} about my ${localizedSpecialty} referral. ${question}`
      : `Hello, I’m following up about my ${localizedSpecialty} referral. ${question} Thank you.`;
  }

  const localizedSpecialty = translateText(specialty, language);
  const prompts = {
    ja: {
      call: `こんにちは。[お名前]です。${recipient}に、${localizedSpecialty}の紹介についてお電話しています。${translateText(question, language)}`,
      message: `こんにちは。${localizedSpecialty}の紹介について確認のご連絡です。${translateText(question, language)}よろしくお願いいたします。`,
    },
    zh: {
      call: `您好，我是[姓名]。我致电${recipient}，想咨询${localizedSpecialty}转诊的情况。${translateText(question, language)}`,
      message: `您好，我想跟进${localizedSpecialty}转诊的情况。${translateText(question, language)}谢谢。`,
    },
    es: {
      call: `Hola, me llamo [tu nombre]. Llamo a ${recipient} para consultar sobre mi referencia a ${localizedSpecialty}. ${translateText(question, language)}`,
      message: `Hola, escribo para dar seguimiento a mi referencia a ${localizedSpecialty}. ${translateText(question, language)} Gracias.`,
    },
    vi: {
      call: `Xin chào, tôi tên là [tên của bạn]. Tôi gọi cho ${recipient} để hỏi về giấy giới thiệu đến khoa ${localizedSpecialty}. ${translateText(question, language)}`,
      message: `Xin chào, tôi liên hệ để hỏi về giấy giới thiệu đến khoa ${localizedSpecialty}. ${translateText(question, language)} Xin cảm ơn.`,
    },
  }[language];
  return kind === "Call script" ? prompts.call : prompts.message;
}
