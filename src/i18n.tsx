import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type AppLanguage = "en" | "ja" | "zh" | "es" | "vi";

const languageLocales: Record<AppLanguage, string> = {
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
  es: "es",
  vi: "vi-VN",
};

const rows: Array<[string, string, string, string, string]> = [
  ["Additional care steps", "追加のケア手順", "其他护理步骤", "Pasos adicionales de atención", "Các bước chăm sóc bổ sung"],
  ["Add imaging, authorization, rescheduled visits, procedures, and follow-ups here. These are your notes, not office-verified status.", "画像検査、事前承認、予約変更、処置、再診などをここに追加できます。これはあなたの記録であり、医療機関が確認した状況ではありません。", "在此添加影像检查、保险授权、改期就诊、手术和复诊。这些是您的记录，并非诊所核实的状态。", "Agrega aquí estudios de imagen, autorizaciones, citas reprogramadas, procedimientos y seguimientos. Son tus notas, no estados verificados por los consultorios.", "Thêm chẩn đoán hình ảnh, phê duyệt bảo hiểm, lịch khám đổi, thủ thuật và tái khám tại đây. Đây là ghi chú của bạn, không phải trạng thái đã được phòng khám xác nhận."],
  ["No additional steps recorded yet. Use “Add update” when the care path changes or continues.", "追加の手順はまだ記録されていません。ケアの流れが変わったり続いたりしたら「更新を追加」を使ってください。", "尚未记录其他步骤。护理流程有变化或继续时，请使用“添加更新”。", "Aún no hay pasos adicionales. Usa “Agregar actualización” cuando el proceso cambie o continúe.", "Chưa ghi lại bước bổ sung nào. Chọn “Thêm cập nhật” khi quá trình chăm sóc thay đổi hoặc tiếp tục."],
  ["Other care step", "その他のケア手順", "其他护理步骤", "Otro paso de atención", "Bước chăm sóc khác"],
  ["Patient recorded", "患者が記録", "患者记录", "Registrado por el paciente", "Bệnh nhân đã ghi"],
  ["Referral checkpoints and what comes next", "紹介の確認ポイントと次のステップ", "转诊检查点及后续步骤", "Puntos de la referencia y próximos pasos", "Các mốc chuyển tuyến và bước tiếp theo"],
  ["These are common referral checkpoints. Care can pause, repeat, branch, and continue after an appointment.", "一般的な紹介の確認ポイントです。ケアは一時停止、繰り返し、分岐し、予約後も続くことがあります。", "这些是常见的转诊检查点。护理过程可能暂停、重复、分支，也可能在预约后继续。", "Estos son puntos comunes de una referencia. La atención puede pausarse, repetirse, tomar distintas rutas y continuar después de una cita.", "Đây là các mốc chuyển tuyến thường gặp. Quá trình chăm sóc có thể tạm dừng, lặp lại, rẽ nhánh và tiếp tục sau cuộc hẹn."],
  ["Tap to record", "タップして記録", "点击记录", "Toca para registrar", "Nhấn để ghi lại"],
  ["YOUR ACTIVITY", "あなたの活動履歴", "你的活动记录", "TU ACTIVIDAD", "HOẠT ĐỘNG CỦA BẠN"],
  ["Confirm how to send the requested records.", "依頼された書類の送付方法を確認してください。", "确认所需资料的发送方式。", "Confirma cómo enviar los documentos solicitados.", "Xác nhận cách gửi hồ sơ được yêu cầu."],
  ["Record the next steps your clinician shared. Referral Navigator won’t interpret them.", "担当医から伝えられた次の手順を記録してください。Referral Navigatorは内容を解釈しません。", "记录临床医生告知的后续步骤。Referral Navigator 不会解读这些内容。", "Registra los próximos pasos que te indicó tu profesional de salud. Referral Navigator no los interpretará.", "Ghi lại các bước tiếp theo mà bác sĩ chia sẻ. Referral Navigator sẽ không diễn giải chúng."],
  ["Records requested", "書類の提出を依頼された", "需要提供资料", "Se solicitaron documentos", "Được yêu cầu gửi hồ sơ"],
  ["Records sent", "書類を送付した", "资料已发送", "Documentos enviados", "Đã gửi hồ sơ"],
  ["Follow-up visit recommended", "再診を勧められた", "建议复诊", "Se recomendó una consulta de seguimiento", "Được đề nghị tái khám"],
  ["Visit completed", "診察が終了した", "就诊已完成", "Visita completada", "Đã hoàn tất buổi khám"],
  ["Common events", "よくある出来事", "常见事件", "Eventos comunes", "Sự kiện thường gặp"],
  ["Activity timeline", "紹介の活動履歴", "转诊活动记录", "Actividad de la referencia", "Hoạt động giới thiệu"],
  ["This history continues after scheduling. Record requests, documents sent, and follow-ups as they happen.", "予約後もこの履歴に記録を続けられます。書類の依頼、書類の送付、再診などをその都度記録してください。", "预约后也可以继续记录。请及时记录资料请求、资料发送和后续复诊。", "Este historial continúa después de programar la cita. Registra las solicitudes, los documentos enviados y las consultas de seguimiento cuando ocurran.", "Lịch sử này vẫn tiếp tục sau khi đặt lịch. Hãy ghi lại các yêu cầu hồ sơ, hồ sơ đã gửi và các lần tái khám khi phát sinh."],
  ["Your referral led to a booked visit", "紹介から受診予約につながりました", "已通过转诊预约就诊", "Tu referencia llevó a una cita programada", "Giấy giới thiệu đã giúp bạn đặt được lịch khám"],
  ["Prepare for your visit", "受診の準備をする", "为就诊做准备", "Prepárate para tu consulta", "Chuẩn bị cho buổi khám"],
  ["Send the requested records", "依頼された書類を送る", "发送所需资料", "Envía los documentos solicitados", "Gửi hồ sơ được yêu cầu"],
  ["Confirm the records arrived", "書類が届いたか確認する", "确认资料已送达", "Confirma que recibieron los documentos", "Xác nhận hồ sơ đã được nhận"],
  ["Plan your follow-up visit", "再診の予定を立てる", "安排复诊", "Organiza tu consulta de seguimiento", "Lên kế hoạch tái khám"],
  ["Record any next steps from your visit", "受診後の次の手順を記録する", "记录就诊后的后续步骤", "Registra los próximos pasos de tu consulta", "Ghi lại các bước tiếp theo sau buổi khám"],
  ["Ask the referring office whether the referral was sent to the specialist.", "紹介元の医療機関に、専門医療機関へ紹介状を送付したか確認してください。", "向转诊诊所确认是否已将转诊发送给专科诊所。", "Pregunta al consultorio que te refirió si envió la referencia al especialista.", "Hãy hỏi phòng khám giới thiệu xem họ đã gửi giấy giới thiệu đến phòng khám chuyên khoa chưa."],
  ["Ask the specialist office whether they received the referral and need anything else.", "専門医療機関に、紹介状が届いているか、ほかに必要なものがあるか確認してください。", "向专科诊所确认是否收到转诊以及是否还需要其他资料。", "Pregunta al consultorio especialista si recibió la referencia y necesita algo más.", "Hãy hỏi phòng khám chuyên khoa xem họ đã nhận giấy giới thiệu chưa và có cần thêm gì không."],
  ["Contact the specialist office to learn what you need before booking.", "予約前に必要なことを専門医療機関に確認してください。", "联系专科诊所，了解预约前需要准备什么。", "Contacta al consultorio especialista para saber qué necesitas antes de programar.", "Liên hệ phòng khám chuyên khoa để hỏi cần chuẩn bị gì trước khi đặt lịch."],
  ["Contact the specialist office to choose a visit time. You can keep recording updates after you schedule.", "専門医療機関に連絡して受診日時を決めてください。予約後も更新を記録できます。", "联系专科诊所选择就诊时间。预约后也可以继续记录更新。", "Contacta al consultorio especialista para elegir una fecha. Puedes seguir registrando novedades después.", "Liên hệ phòng khám chuyên khoa để chọn lịch khám. Bạn vẫn có thể tiếp tục ghi cập nhật sau khi đặt lịch."],
  ["The specialist may still ask for records, imaging, or other details. Record any new requests in your activity timeline.", "専門医療機関から書類や画像などを求められる場合があります。新しい依頼があれば活動履歴に記録してください。", "专科诊所可能还会要求病历、影像或其他资料。请在活动记录中记录新的要求。", "El especialista aún podría pedir documentos, estudios u otros datos. Registra cualquier solicitud nueva en tu actividad.", "Phòng khám chuyên khoa vẫn có thể yêu cầu hồ sơ, hình ảnh hoặc thông tin khác. Hãy ghi các yêu cầu mới vào dòng thời gian hoạt động."],
  ["Confirm how to send the requested records", "依頼された書類の送付方法を確認する", "确认所需资料的发送方式", "Confirma cómo enviar los documentos solicitados", "Xác nhận cách gửi hồ sơ được yêu cầu"],
  ["Record when the requested records are sent", "依頼された書類を送付した日を記録する", "记录所需资料的发送时间", "Registra cuándo envías los documentos solicitados", "Ghi lại ngày gửi hồ sơ được yêu cầu"],
  ["Record the office’s response", "医療機関からの返答を記録する", "记录诊所的回复", "Registra la respuesta del consultorio", "Ghi lại phản hồi của phòng khám"],
  ["Ask how to schedule your follow-up", "再診の予約方法を確認する", "询问如何安排复诊", "Pregunta cómo programar tu seguimiento", "Hỏi cách đặt lịch tái khám"],
  ["Add the follow-up date to your timeline", "再診の日付を履歴に追加する", "将复诊日期添加到时间线", "Agrega la fecha de seguimiento a tu historial", "Thêm ngày tái khám vào dòng thời gian"],
  ["Ask whether records or imaging are needed", "書類や画像が必要か確認する", "确认是否需要病历或影像资料", "Pregunta si se necesitan documentos o estudios", "Hỏi xem có cần hồ sơ hoặc hình ảnh không"],
  ["Prepare questions for your visit", "受診時の質問を準備する", "准备就诊时要问的问题", "Prepara preguntas para tu consulta", "Chuẩn bị câu hỏi cho buổi khám"],
  ["Review your visit notes", "受診メモを確認する", "查看就诊记录", "Revisa tus notas de la consulta", "Xem lại ghi chú buổi khám"],
  ["Could you tell me how to send the requested records?", "依頼された書類の送付方法を教えていただけますか？", "请问我该如何发送所需资料？", "¿Podrían decirme cómo enviar los documentos solicitados?", "Xin cho tôi biết cách gửi hồ sơ được yêu cầu được không?"],
  ["Could you confirm whether you received the requested records?", "依頼された書類が届いているか確認していただけますか？", "请确认是否收到了所需资料。", "¿Podrían confirmar si recibieron los documentos solicitados?", "Xin xác nhận đã nhận được hồ sơ được yêu cầu chưa?"],
  ["Could you help me schedule a follow-up visit?", "再診の予約をお手伝いいただけますか？", "可以帮我安排复诊吗？", "¿Podrían ayudarme a programar una consulta de seguimiento?", "Phòng khám có thể giúp tôi đặt lịch tái khám không?"],
  ["Could you clarify the next steps we discussed?", "話し合った次の手順を確認させていただけますか？", "请说明我们讨论的后续步骤。", "¿Podrían aclararme los próximos pasos que hablamos?", "Xin làm rõ các bước tiếp theo mà chúng ta đã trao đổi."],
  ["What should I bring or prepare before the appointment?", "予約の前に持参または準備すべきものはありますか？", "预约前我需要携带或准备什么吗？", "¿Debo llevar o preparar algo antes de la cita?", "Tôi cần mang theo hoặc chuẩn bị gì trước buổi hẹn không?"],
  ["Who did this update come from?", "この更新は誰からの情報ですか？", "这条更新的信息来自谁？", "¿De quién proviene esta actualización?", "Thông tin cập nhật này đến từ ai?"],
  ["Add details, names, or reference numbers if useful.", "必要に応じて詳細、名前、照会番号を追加してください。", "如有需要，请添加详情、姓名或参考编号。", "Agrega detalles, nombres o números de referencia si ayudan.", "Nếu cần, hãy thêm chi tiết, tên hoặc mã tham chiếu."],
  ["Select confirmed referral steps", "確認済みの紹介ステップを選択", "选择已确认的转诊步骤", "Selecciona los pasos confirmados de la referencia", "Chọn các bước giới thiệu đã xác nhận"],
  ["Select any referral steps you know have happened", "起きたことがわかっている紹介のステップをすべて選んでください", "请选择你确认已经发生的转诊步骤", "Selecciona todos los pasos de la referencia que sabes que ocurrieron", "Chọn mọi bước giới thiệu mà bạn biết đã xảy ra"],
  ["Use these together only when the same source confirmed each step. Record separate updates if different offices confirmed them.", "同じ情報源から各ステップを確認した場合に一緒に選択してください。異なる医療機関から確認した場合は、別々に記録してください。", "仅在同一信息来源确认了每个步骤时一起选择。如果不同诊所分别确认，请分开记录。", "Selecciona varios solo si la misma fuente confirmó cada paso. Registra actualizaciones separadas si las confirmaron consultorios distintos.", "Chỉ chọn cùng lúc khi cùng một nguồn xác nhận từng bước. Hãy ghi riêng nếu các phòng khám khác nhau xác nhận."],
  ["Referral progress update", "紹介の進捗更新", "转诊进度更新", "Actualización del progreso de la referencia", "Cập nhật tiến độ giấy giới thiệu"],
  ["Who told you about these steps?", "これらのステップについて誰から聞きましたか？", "谁告诉你这些步骤的情况？", "¿Quién te informó sobre estos pasos?", "Ai đã cho bạn biết về các bước này?"],
  ["When did this happen?", "これはいつ起きましたか？", "这是什么时候发生的？", "¿Cuándo ocurrió esto?", "Việc này xảy ra khi nào?"],
  ["Optional", "任意", "选填", "Opcional", "Không bắt buộc"],
  ["Happened", "発生日", "发生时间", "Ocurrió", "Đã xảy ra"],
  ["Recorded", "記録日", "记录时间", "Registrado", "Đã ghi nhận"],
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
  ["One place to organize what you know, track what’s still unclear, and prepare to follow up with the right office.", "わかっていることを整理し、不明点を記録し、適切な医療機関への連絡を準備できる場所です。", "在这里整理已知信息、记录尚不清楚的事项，并准备联系合适的诊所。", "Un solo lugar para organizar lo que sabes, seguir lo que aún no está claro y prepararte para contactar al consultorio adecuado.", "Một nơi để sắp xếp thông tin đã biết, theo dõi những điều chưa rõ và chuẩn bị liên hệ đúng phòng khám."],
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
  ["Create an account", "アカウントを作成", "创建账户", "Crear una cuenta", "Tạo tài khoản"],
  ["Sign in", "サインイン", "登录", "Iniciar sesión", "Đăng nhập"],
  ["Know what’s confirmed—and what to ask next.", "確認できていることと、次に聞くことがわかります。", "了解哪些信息已确认，以及接下来该问什么。", "Descubre qué está confirmado y qué conviene preguntar después.", "Biết điều gì đã được xác nhận và nên hỏi gì tiếp theo."],
  ["This tool can’t verify referral status, give medical advice, or determine insurance coverage. Confirm details with the relevant office or your health plan.", "このツールは紹介状況の確認、医療アドバイス、保険適用の判定を行いません。詳しくは該当する医療機関または保険会社にご確認ください。", "此工具无法核实转诊状态、提供医疗建议或判定保险覆盖范围。请向相关诊所或健康保险计划确认详情。", "Esta herramienta no puede verificar el estado de la referencia, dar consejos médicos ni determinar la cobertura. Confirma los detalles con el consultorio correspondiente o tu plan de salud.", "Công cụ này không thể xác minh trạng thái giới thiệu, tư vấn y tế hoặc xác định quyền lợi bảo hiểm. Hãy xác nhận thông tin với phòng khám liên quan hoặc chương trình bảo hiểm sức khỏe của bạn."],
  ["← Back to home", "← ホームに戻る", "← 返回首页", "← Volver al inicio", "← Quay lại trang chủ"],
  ["YOUR REFERRAL, ORGANIZED", "紹介状況を整理しましょう", "整理你的转诊信息", "ORGANIZA TU REFERENCIA", "SẮP XẾP THÔNG TIN GIỚI THIỆU"],
  ["Welcome back", "おかえりなさい", "欢迎回来", "Te damos la bienvenida", "Chào mừng bạn quay lại"],
  ["Create your account", "アカウントを作成", "创建账户", "Crea tu cuenta", "Tạo tài khoản"],
  ["Sign in to keep your referral details and updates together.", "サインインして、紹介の詳細と更新情報をまとめて管理しましょう。", "登录后即可集中管理转诊详情和更新。", "Inicia sesión para tener juntos los detalles y las actualizaciones de tus referencias.", "Đăng nhập để lưu thông tin giới thiệu và cập nhật cùng nhau."],
  ["Create an account to save your referral details securely for your own use.", "アカウントを作成して、紹介の詳細を安全に保存し、ご自身で管理できます。", "创建账户，安全保存转诊详情供自己使用。", "Crea una cuenta para guardar de forma segura los detalles de tus referencias para tu uso personal.", "Tạo tài khoản để lưu an toàn thông tin giới thiệu cho riêng bạn."],
  ["This preview isn’t connected to Supabase yet. Check its Vercel environment variables.", "このプレビューはまだ Supabase に接続されていません。Vercel の環境変数を確認してください。", "此预览尚未连接到 Supabase。请检查 Vercel 环境变量。", "Esta vista previa aún no está conectada a Supabase. Revisa las variables de entorno de Vercel.", "Bản xem trước này chưa kết nối với Supabase. Hãy kiểm tra các biến môi trường trên Vercel."],
  ["Something went wrong. Please try again.", "問題が発生しました。もう一度お試しください。", "出了点问题，请重试。", "Algo salió mal. Inténtalo de nuevo.", "Đã xảy ra lỗi. Vui lòng thử lại."],
  ["Check your email for a confirmation link, then return here to sign in.", "確認リンクをメールで確認し、この画面に戻ってサインインしてください。", "请查看邮件中的确认链接，然后返回此处登录。", "Busca el enlace de confirmación en tu correo y vuelve aquí para iniciar sesión.", "Hãy kiểm tra email để mở liên kết xác nhận, sau đó quay lại đây để đăng nhập."],
  ["Name", "お名前", "姓名", "Nombre", "Họ tên"],
  ["Password", "パスワード", "密码", "Contraseña", "Mật khẩu"],
  ["Use at least 8 characters.", "8 文字以上で入力してください。", "请至少输入 8 个字符。", "Usa al menos 8 caracteres.", "Sử dụng ít nhất 8 ký tự."],
  ["Please wait…", "お待ちください…", "请稍候…", "Espera…", "Vui lòng chờ…"],
  ["Create account", "アカウントを作成", "创建账户", "Crear cuenta", "Tạo tài khoản"],
  ["New to Referral Navigator?", "Referral Navigator を初めてご利用ですか？", "第一次使用 Referral Navigator？", "¿Es tu primera vez en Referral Navigator?", "Bạn mới sử dụng Referral Navigator?"],
  ["Already have an account?", "すでにアカウントをお持ちですか？", "已经有账户了吗？", "¿Ya tienes una cuenta?", "Bạn đã có tài khoản?"],
  ["Updates are entered by you. Referral status isn’t checked automatically.", "更新はあなた自身が入力します。紹介状況は自動で確認されません。", "更新由你自行输入。系统不会自动查询转诊状态。", "Tú ingresas las actualizaciones. El estado de la referencia no se comprueba automáticamente.", "Bạn tự nhập thông tin cập nhật. Trạng thái giới thiệu không được tự động kiểm tra."],
  ["A CLEARER HANDOFF", "わかりやすい引き継ぎ", "让转诊交接更清晰", "UN PROCESO MÁS CLARO", "BÀN GIAO RÕ RÀNG HƠN"],
  ["Know what’s confirmed, and what to ask next.", "確認できていることと、次に聞くことがわかります。", "了解哪些信息已确认，以及接下来该问什么。", "Descubre qué está confirmado y qué conviene preguntar después.", "Biết điều gì đã được xác nhận và nên hỏi gì tiếp theo."],
  ["Referral Navigator helps you keep the details straight while you follow up at your own pace.", "Referral Navigator は、あなたのペースでフォローアップできるよう、情報を整理します。", "Referral Navigator 帮你整理信息，让你按自己的节奏跟进。", "Referral Navigator te ayuda a organizar la información mientras haces seguimiento a tu ritmo.", "Referral Navigator giúp bạn sắp xếp thông tin và theo dõi theo nhịp độ của mình."],
  ["Save what you know", "わかっていることを記録", "记录已知信息", "Guarda lo que sabes", "Lưu thông tin bạn biết"],
  ["Note the specialist, referring office, and what your clinician recommended.", "専門医、紹介元の医療機関、担当医の提案を記録します。", "记录专科医生、转诊诊所和临床医生的建议。", "Anota el especialista, el consultorio que te refirió y la recomendación de tu profesional de salud.", "Ghi lại bác sĩ chuyên khoa, nơi giới thiệu và đề xuất của bác sĩ."],
  ["Follow up with confidence", "安心してフォローアップ", "放心跟进", "Haz seguimiento con confianza", "Theo dõi với sự tự tin"],
  ["See a practical next step and prepare a call script or message to review.", "次にできることを確認し、電話用スクリプトやメッセージを作成して確認できます。", "查看可执行的下一步，并准备电话提纲或信息供你审核。", "Consulta un siguiente paso práctico y prepara un guion de llamada o mensaje para revisar.", "Xem bước tiếp theo và chuẩn bị kịch bản gọi điện hoặc tin nhắn để xem lại."],
  ["Record what you hear", "聞いた内容を記録", "记录沟通内容", "Registra lo que te dicen", "Ghi lại điều bạn được thông báo"],
  ["Add the response and label whether it came from you or an office.", "回答を追加し、あなた自身または医療機関からの情報かを表示します。", "记录回复，并标明信息来自你本人还是诊所。", "Añade la respuesta e indica si provino de ti o de un consultorio.", "Thêm phản hồi và ghi rõ thông tin đến từ bạn hay phòng khám."],
  ["Your tracker is yours to update.", "記録を更新するのはあなたです。", "你的记录由你更新。", "Tú eres quien actualiza el registro.", "Bạn là người cập nhật danh sách này."],
  ["This tool can’t verify referral status, give medical advice, or determine insurance coverage.", "このツールは紹介状況の確認、医療アドバイス、保険適用の判定を行いません。", "此工具无法核实转诊状态、提供医疗建议或判定保险覆盖范围。", "Esta herramienta no puede verificar el estado de la referencia, dar consejos médicos ni determinar la cobertura.", "Công cụ này không thể xác minh trạng thái giới thiệu, tư vấn y tế hoặc xác định quyền lợi bảo hiểm."],
  ["Referral Navigator · A personal referral companion", "Referral Navigator · 紹介状況を管理するツール", "Referral Navigator · 个人转诊助手", "Referral Navigator · Asistente personal de referencias", "Referral Navigator · Công cụ hỗ trợ theo dõi giới thiệu cá nhân"],
  ["REVIEW BEFORE YOU SEND", "送信前に確認", "发送前请审核", "REVISA ANTES DE ENVIAR", "XEM LẠI TRƯỚC KHI GỬI"],
  ["Call script, text or portal message", "電話用スクリプト、テキスト、またはポータルメッセージ", "电话提纲、短信或患者门户信息", "Guion de llamada, mensaje de texto o mensaje del portal", "Kịch bản gọi điện, tin nhắn văn bản hoặc tin nhắn trên cổng thông tin"],
  ["The Referral Agent prepares a draft from your latest referral updates. Review and edit it before use; nothing is sent from here.", "Referral Agent が最新の紹介状況に基づいて下書きを作成します。使用前に確認・編集してください。ここから送信されることはありません。", "转诊助手会根据你最新的转诊更新准备草稿。使用前请先审核和编辑；此处不会发送任何内容。", "El Agente de Referencias prepara un borrador con las actualizaciones más recientes. Revísalo y edítalo antes de usarlo; no se envía desde aquí.", "Referral Agent soạn bản nháp dựa trên cập nhật giới thiệu mới nhất. Hãy xem lại và chỉnh sửa trước khi dùng; nội dung sẽ không được gửi từ đây."],
  ["Call script", "電話用スクリプト", "电话提纲", "Guion de llamada", "Kịch bản gọi điện"],
  ["Text message", "テキストメッセージ", "短信", "Mensaje de texto", "Tin nhắn văn bản"],
  ["Text message draft", "テキストメッセージの下書き", "短信草稿", "Borrador de mensaje de texto", "Bản nháp tin nhắn văn bản"],
  ["Call script draft", "電話用スクリプトの下書き", "电话提纲草稿", "Borrador de guion de llamada", "Bản nháp kịch bản gọi điện"],
  ["Portal message draft", "ポータルメッセージの下書き", "患者门户信息草稿", "Borrador de mensaje del portal", "Bản nháp tin nhắn trên cổng thông tin"],
  ["Email draft", "メールの下書き", "电子邮件草稿", "Borrador de correo electrónico", "Bản nháp email"],
  ["draft", "下書き", "草稿", "borrador", "bản nháp"],
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
  ["Draft a text or portal message", "テキストまたはポータルメッセージを作成", "起草短信或患者门户信息", "Redactar un mensaje de texto o del portal", "Soạn tin nhắn văn bản hoặc tin nhắn trên cổng thông tin"],
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
  ["Call script, text or portal message", "電話用スクリプト、テキスト、またはポータルメッセージ", "电话提纲、短信或患者门户信息", "Guion de llamada, mensaje de texto o mensaje del portal", "Kịch bản gọi điện, tin nhắn văn bản hoặc tin nhắn trên cổng thông tin"],
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
  ["Not sent","未送付","尚未发送","No enviada","Chưa gửi"],
  ["Sent · awaiting receipt","送付済み · 受領待ち","已发送 · 等待确认收件","Enviada · falta confirmar recepción","Đã gửi · chờ xác nhận đã nhận"],
  ["Received","受領済み","已收到","Recibida","Đã nhận"],
  ["Awaiting records","記録待ち","等待资料","En espera de documentos","Đang chờ hồ sơ"],
  ["Possible specialist decline","専門医療機関が断る可能性","专科诊所可能拒绝","Posible rechazo del especialista","Có thể bị phòng khám chuyên khoa từ chối"],
  ["Declined by specialist","専門医療機関が受け入れを断った","专科诊所已拒绝","Rechazada por el especialista","Bị bác sĩ chuyên khoa từ chối"],
  ["Status not confirmed","状況未確認","状态尚未确认","Estado sin confirmar","Chưa xác nhận trạng thái"],
  ["Appointment scheduled","予約済み","已预约","Cita programada","Đã đặt lịch hẹn"],
  ["Appointment completed","受診済み","已完成就诊","Cita completada","Đã hoàn tất buổi hẹn"],
  ["Record appointment booked","予約を記録","记录预约","Registrar la cita programada","Ghi nhận lịch hẹn"],
  ["Mark appointment complete","受診完了を記録","标记就诊已完成","Marcar la cita como completada","Đánh dấu buổi hẹn đã hoàn tất"],
  ["Appointment date (if known)","予約日（わかる場合）","预约日期（如已知）","Fecha de la cita (si la sabes)","Ngày hẹn (nếu đã biết)"],
  ["Appointment time (if known)","予約時間（わかる場合）","预约时间（如已知）","Hora de la cita (si la sabes)","Giờ hẹn (nếu đã biết)"],
  ["This records what you entered; it doesn’t confirm the booking with the office.","入力内容を記録するだけで、医療機関への予約確認は行いません。","此处只记录你输入的信息，不会向诊所确认预约。","Esto registra lo que ingresaste; no confirma la cita con el consultorio.","Thao tác này chỉ ghi lại thông tin bạn nhập, không xác nhận lịch hẹn với phòng khám."],
  ["The specialist office confirmed it can proceed and any requested records or review steps are complete.","専門医療機関が次の予約手続きに進めると確認し、必要な記録や確認が完了したと記録しました。","你记录了专科诊所确认可以继续，且所需资料或审核步骤已完成。","Registraste que el consultorio especialista confirmó que puede continuar y que los documentos o revisiones necesarios están completos.","Bạn đã ghi nhận phòng khám chuyên khoa xác nhận có thể tiếp tục và các hồ sơ hoặc bước xem xét cần thiết đã hoàn tất."],
  ["After the visit, record any next steps you were given","受診後、案内された次のステップを記録","就诊后记录收到的后续安排","Después de la consulta, registra los siguientes pasos que te indiquen","Sau buổi khám, ghi lại các bước tiếp theo được hướng dẫn"],
  ["Record the date once you’ve booked with the office","予約したら日付を記録","预约后记录日期","Registra la fecha después de reservar con el consultorio","Ghi ngày sau khi bạn đặt lịch với phòng khám"],
  ["Possible, not confirmed","可能性あり・未確認","可能，但尚未确认","Posible, sin confirmar","Có thể, chưa xác nhận"],
  ["Status not confirmed / general note","状況未確認／一般メモ","状态尚未确认／一般备注","Estado sin confirmar / nota general","Chưa xác nhận trạng thái / ghi chú chung"],
  ["No insurance update","保険に関する更新なし","暂无保险更新","Sin actualización del seguro","Không có cập nhật bảo hiểm"],
  ["Authorization required","事前承認が必要","需要事先授权","Se requiere autorización","Cần được chấp thuận trước"],
  ["Possible out-of-network issue","ネットワーク外の可能性","可能不在保险网络内","Posible problema fuera de la red","Có thể ngoài mạng lưới bảo hiểm"],
  ["Coverage confirmed","保険適用を確認済み","已确认保险覆盖","Cobertura confirmada","Đã xác nhận quyền lợi bảo hiểm"],
  ["Insurance status does not change specialist acceptance or handoff status.","保険状況によって、専門医療機関の受け入れや紹介の引き継ぎ状況は変わりません。","保险状态不会改变专科诊所是否接收或转诊交接状态。","El estado del seguro no cambia la aceptación del especialista ni el estado de la referencia.","Tình trạng bảo hiểm không làm thay đổi việc phòng khám chuyên khoa tiếp nhận hay trạng thái chuyển tuyến."],
  ["Who is expected to provide it?","誰が提供する予定ですか？","预计由谁提供？","¿Quién debe proporcionarlo?","Ai dự kiến sẽ cung cấp hồ sơ này?"],
  ["How certain is this update?","この更新はどの程度確実ですか？","这条更新的确定程度如何？","¿Qué tan confirmada está esta actualización?","Thông tin cập nhật này chắc chắn đến mức nào?"],
  ["Specialist office confirmed decline","専門医療機関が受け入れ不可を確認","专科诊所确认拒绝","El consultorio especialista confirmó el rechazo","Phòng khám chuyên khoa xác nhận từ chối"],
  ["Possible / not final","可能性あり／未決定","可能／尚未最终决定","Posible / no definitivo","Có thể / chưa phải quyết định cuối cùng"],
  ["Example referral progress","紹介の進捗例","转诊进度示例","Ejemplo del progreso de una referencia","Ví dụ về tiến trình chuyển tuyến"],
  ["Record an appointment only after the specialist confirms the referral is ready to schedule.","専門医療機関が紹介を予約可能と確認した後に、予約を記録してください。","只有在专科诊所确认转诊可以预约后，才能记录预约。","Registra una cita solo después de que el especialista confirme que la referencia está lista para programarse.","Chỉ ghi nhận lịch hẹn sau khi phòng khám chuyên khoa xác nhận có thể đặt lịch."],
  ["Mark the appointment complete after you have recorded it as scheduled.","予約済みとして記録した後に、受診完了を記録してください。","先记录已预约，再标记就诊已完成。","Marca la cita como completada después de registrarla como programada.","Chỉ đánh dấu buổi hẹn đã hoàn tất sau khi ghi nhận lịch đã đặt."],
  ["You recorded an appointment booking.","予約したと記録しました。","你记录了已预约。","Registraste una cita programada.","Bạn đã ghi nhận đã đặt lịch hẹn."],
  ["You recorded that the appointment is complete.","受診が完了したと記録しました。","你记录了就诊已完成。","Registraste que la cita se completó.","Bạn đã ghi nhận buổi hẹn đã hoàn tất."],
  ["A record is needed before specialist review can continue.","専門医療機関の確認を進めるには記録が必要です。","专科审核需要先补充资料。","Se necesita un documento para que el especialista continúe la revisión.","Cần có hồ sơ trước khi phòng khám chuyên khoa tiếp tục xem xét."],
  ["Review the specialist-office update and confirm whether the decision is final.","専門医療機関の更新内容を確認し、決定が最終かどうか確かめてください。","查看专科诊所的更新，并确认是否已作出最终决定。","Revisa la actualización del consultorio especialista y confirma si la decisión es definitiva.","Xem cập nhật từ phòng khám chuyên khoa và xác nhận quyết định đã là cuối cùng chưa."],
  ["The specialist confirmed it can proceed to scheduling.","専門医療機関が予約手続きに進めると確認しました。","专科诊所确认可以继续预约。","El especialista confirmó que se puede continuar con la programación.","Phòng khám chuyên khoa xác nhận có thể tiếp tục đặt lịch."],
  ["You recorded an appointment booking.","予約したと記録しました。","你记录了已预约。","Registraste una cita programada.","Bạn đã ghi nhận đã đặt lịch hẹn."],
  ["You recorded that the appointment is complete.","受診が完了したと記録しました。","你记录了就诊已完成。","Registraste que la cita se completó.","Bạn đã ghi nhận buổi hẹn đã hoàn tất."],
  ["The specialist may decline this referral.","専門医療機関がこの紹介を断る可能性があります。","专科诊所可能拒绝此转诊。","El especialista podría rechazar esta referencia.","Phòng khám chuyên khoa có thể từ chối giấy giới thiệu này."],
  ["The specialist office declined the referral.","専門医療機関が紹介を断りました。","专科诊所拒绝了此转诊。","El consultorio especialista rechazó la referencia.","Phòng khám chuyên khoa đã từ chối giấy giới thiệu."],
  ["The referral may be declined unless a record is provided.","記録が提出されない場合、紹介が断られる可能性があります。","如不提供资料，此转诊可能会被拒绝。","La referencia podría rechazarse si no se proporciona un documento.","Giấy giới thiệu có thể bị từ chối nếu không cung cấp hồ sơ."],
  ["A record may be needed before review.","確認前に記録が必要な可能性があります。","审核前可能需要补充资料。","Es posible que se necesite un documento antes de la revisión.","Có thể cần hồ sơ trước khi xem xét."],
  ["The referral has not been sent yet.","紹介状はまだ送付されていません。","转诊尚未发送。","La referencia aún no se ha enviado.","Giấy giới thiệu vẫn chưa được gửi."],
  ["Referral status is not confirmed yet.","紹介状況はまだ確認されていません。","转诊状态尚未确认。","El estado de la referencia aún no está confirmado.","Trạng thái chuyển tuyến vẫn chưa được xác nhận."],
  ["The referral is sent; receipt is not confirmed.","紹介状は送付済みですが、受領は未確認です。","转诊已发送，但尚未确认收到。","La referencia se envió, pero la recepción no está confirmada.","Giấy giới thiệu đã gửi nhưng chưa xác nhận đã nhận."],
  ["Receipt is confirmed; review status is still open.","受領は確認済みですが、審査状況は未確定です。","已确认收到，但审核状态尚未确定。","La recepción está confirmada; la revisión sigue pendiente.","Đã xác nhận tiếp nhận; trạng thái xem xét vẫn chưa rõ."],
  ["The specialist office confirmed receipt. That does not confirm acceptance or scheduling readiness.","専門医療機関の受領確認は、受け入れや予約可能の確認を意味するものではありません。","专科诊所确认收到，不代表已接收患者或可以预约。","La confirmación de recepción no significa que el especialista haya aceptado la referencia ni que esté lista para programarse.","Xác nhận đã nhận không đồng nghĩa phòng khám chuyên khoa đã tiếp nhận hoặc có thể đặt lịch."],
  ["Receipt is distinct from specialist acceptance and from insurance authorization.","受領、専門医療機関の受け入れ、保険の事前承認はそれぞれ別の状況です。","确认收到、专科诊所接收和保险事先授权是不同事项。","La recepción, la aceptación del especialista y la autorización del seguro son cuestiones distintas.","Việc đã nhận, việc phòng khám chuyên khoa tiếp nhận và sự chấp thuận của bảo hiểm là những việc riêng biệt."],
  ["Your appointment is scheduled.","予約が完了しました。","你的预约已安排。","Tu cita está programada.","Lịch hẹn của bạn đã được sắp xếp."],
  ["You recorded that an appointment has been scheduled.","予約が入ったと記録しました。","你记录了预约已安排。","Registraste que se programó una cita.","Bạn đã ghi nhận lịch hẹn đã được đặt."],
  ["Keep any preparation instructions from the office handy. After your visit, record any next steps your clinician gives you.","医療機関からの準備の指示を手元に置いてください。受診後、担当者から案内された次のステップを記録しましょう。","请留意诊所提供的就诊准备说明。看诊后记录临床人员给出的后续安排。","Ten a mano las instrucciones de preparación del consultorio. Después de la consulta, registra los pasos que te indique tu profesional de salud.","Hãy giữ hướng dẫn chuẩn bị của phòng khám. Sau buổi khám, ghi lại các bước tiếp theo mà nhân viên y tế hướng dẫn."],
  ["Is there anything I should bring or do before my appointment?","予約前に持参するものや、しておくことはありますか？","预约前我需要携带或做些什么吗？","¿Debo llevar algo o hacer algo antes de mi cita?","Tôi có cần mang theo gì hoặc làm gì trước buổi hẹn không?"],
  ["You recorded that the appointment is complete.","受診が完了したと記録しました。","你记录了就诊已完成。","Registraste que la cita se completó.","Bạn đã ghi nhận buổi hẹn đã hoàn tất."],
  ["Add any follow-up instructions or next appointment your clinician recommended, if there are any.","担当者から案内されたフォローアップや次回予約があれば記録してください。","如临床人员建议了后续安排或复诊，请添加记录。","Añade las instrucciones de seguimiento o la próxima cita que te haya recomendado tu profesional de salud, si las hay.","Ghi lại hướng dẫn theo dõi hoặc lịch hẹn tiếp theo nếu nhân viên y tế có đề xuất."],
  ["Record the follow-up plan you were given, or add a note if no further step was discussed. The app won’t interpret your care plan.","案内されたフォローアップ計画を記録してください。次の対応について話していない場合はメモを追加してください。このアプリはケア計画を解釈しません。","记录收到的后续计划；如果没有讨论后续步骤，可添加备注。本应用不会解读你的护理计划。","Registra el plan de seguimiento que te dieron o añade una nota si no se habló de otros pasos. La aplicación no interpretará tu plan de atención.","Ghi lại kế hoạch theo dõi được hướng dẫn hoặc thêm ghi chú nếu không có bước tiếp theo. Ứng dụng không diễn giải kế hoạch chăm sóc."],
  ["Could you clarify the follow-up steps we discussed and when I should complete them?","話し合ったフォローアップの手順と、いつ行えばよいかを確認していただけますか？","能否说明我们讨论的后续步骤，以及我应何时完成？","¿Podrían aclararme los pasos de seguimiento que hablamos y cuándo debo completarlos?","Bạn có thể làm rõ các bước theo dõi đã trao đổi và khi nào tôi nên thực hiện không?"],
  ["Based on the appointment update you recorded; the app does not verify the booking.","あなたが記録した予約情報に基づいています。このアプリは予約を確認しません。","根据你记录的预约更新；本应用不会核实预约。","Se basa en la actualización de cita que registraste; la aplicación no verifica la reserva.","Dựa trên cập nhật lịch hẹn bạn đã ghi; ứng dụng không xác minh việc đặt lịch."],
  ["Based on your recorded update; this does not indicate a medical outcome.","あなたが記録した更新に基づいています。医学的な結果を示すものではありません。","根据你记录的更新；这不代表任何医疗结果。","Se basa en la actualización que registraste; no indica un resultado médico.","Dựa trên cập nhật bạn ghi; điều này không cho biết kết quả y tế."],
  ["The app won’t interpret your care plan.","このアプリはケア計画を解釈しません。","本应用不会解读你的护理计划。","La aplicación no interpretará tu plan de atención.","Ứng dụng không diễn giải kế hoạch chăm sóc của bạn."],
  ["e.g. latest dental X-ray","例：最新の歯科X線画像","例如：最新牙科X光片","Ej.: radiografía dental más reciente","Ví dụ: phim X-quang răng mới nhất"],
  ["Specialist review & records","専門医療機関の確認と記録","专科审核与资料","Revisión del especialista y documentos","Phòng khám chuyên khoa xem xét và hồ sơ"],
  ["Resolve requested information before review","審査前に必要な情報をそろえる","审核前补齐所需资料","Completa la información solicitada antes de la revisión","Bổ sung thông tin được yêu cầu trước khi xem xét"],
  ["Only after the specialist confirms review is complete","専門医療機関が確認完了と伝えた後のみ","仅在专科诊所确认审核完成后","Solo después de que el especialista confirme que terminó la revisión","Chỉ sau khi phòng khám chuyên khoa xác nhận đã xem xét xong"],
  ["What record is needed? (if known)","必要な記録は何ですか？（わかる場合）","需要什么资料？（如已知）","¿Qué documento se necesita? (si lo sabes)","Cần hồ sơ nào? (nếu đã biết)"],
  ["Not sure","不明","不确定","No se sabe","Chưa rõ"],
  ["Reason the specialist gave (if stated)","専門医療機関が伝えた理由（あれば）","专科诊所给出的原因（如有说明）","Motivo indicado por el especialista (si lo dijo)","Lý do phòng khám chuyên khoa đưa ra (nếu có)"],
  ["Use the specialist office’s words. Don’t guess at the reason.","専門医療機関の言葉を記録してください。理由を推測しないでください。","请按专科诊所的原话记录，不要猜测原因。","Usa las palabras del consultorio especialista. No supongas el motivo.","Hãy dùng đúng lời của phòng khám chuyên khoa. Đừng đoán lý do."],
  ["Record Ready to schedule only after the specialist confirms it can proceed and required records or review are complete.","専門医療機関が進行可能と確認し、必要な記録や審査が完了してから「予約可能」を記録してください。","只有在专科诊所确认可以继续且所需资料或审核已完成后，才能记录“可以预约”。","Registra “Listo para programar” solo después de que el especialista confirme que puede continuar y que los documentos o la revisión están completos.","Chỉ ghi nhận “Sẵn sàng đặt lịch” sau khi phòng khám chuyên khoa xác nhận có thể tiếp tục và hồ sơ hoặc bước xem xét đã hoàn tất."],
  ["Insurance update (tracked separately)","保険の更新（別に記録）","保险更新（单独跟踪）","Actualización del seguro (seguimiento separado)","Cập nhật bảo hiểm (theo dõi riêng)"],
  ["Referral status is still open.","紹介状の状況は未確定です。","转诊状态仍未确定。","El estado de la referencia sigue abierto.","Trạng thái chuyển tuyến vẫn chưa được xác định."],
  ["Appointment ·","予約 ·","预约 ·","Cita ·","Lịch hẹn ·"],
  ["Time ·","時間 ·","时间 ·","Hora ·","Giờ ·"],
  ["Specialist response needed","専門医療機関からの回答が必要","需要专科诊所回复","Se necesita una respuesta del especialista","Cần phản hồi từ phòng khám chuyên khoa"],
  ["Confirm the referring office sent it","紹介元が送付したか確認","确认转诊诊所已发送","Confirma que el consultorio que te refirió la envió","Xác nhận nơi giới thiệu đã gửi"],
  ["The specialist office confirms arrival","専門医療機関が受領を確認","专科诊所确认收到","El consultorio especialista confirma la recepción","Phòng khám chuyên khoa xác nhận đã nhận"],
  ["Only after confirmation","確認後のみ","仅在确认后","Solo después de la confirmación","Chỉ sau khi xác nhận"],
  ["Not recorded","未記録","尚未记录","Sin registrar","Chưa ghi nhận"],
  ["After appointment","予約後","预约后","Después de la cita","Sau cuộc hẹn"],
  ["Specialist office requested an X-ray","専門医療機関がX線画像を依頼","专科诊所要求提供X光片","El consultorio especialista solicitó una radiografía","Phòng khám chuyên khoa yêu cầu phim X-quang"],
  ["Peninsula Oral Surgery said they still need the latest dental X-ray before they can review it.","Peninsula Oral Surgery は、確認前に最新の歯科X線画像がまだ必要だと伝えました。","Peninsula Oral Surgery 表示审核前仍需要最新的牙科X光片。","Peninsula Oral Surgery dijo que aún necesita la radiografía dental más reciente para revisarla.","Peninsula Oral Surgery cho biết họ vẫn cần phim X-quang răng mới nhất trước khi xem xét."],
  ["Specialist office confirmed receipt","専門医療機関が受領を確認","专科诊所确认收到","El consultorio especialista confirmó la recepción","Phòng khám chuyên khoa đã xác nhận tiếp nhận"],
  ["Peninsula Oral Surgery confirmed receipt and opened the referral for review.","Peninsula Oral Surgery は受領を確認し、紹介状の確認を開始しました。","Peninsula Oral Surgery 确认已收到转诊，并开始审核。","Peninsula Oral Surgery confirmó la recepción y comenzó a revisar la referencia.","Peninsula Oral Surgery xác nhận đã nhận và bắt đầu xem xét giấy giới thiệu."],
  ["The specialist office confirmed receipt and opened the referral for review.","専門医療機関が受領を確認し、紹介状の確認を開始しました。","专科诊所确认已收到转诊，并开始审核。","El consultorio especialista confirmó la recepción y comenzó a revisar la referencia.","Phòng khám chuyên khoa xác nhận đã nhận và bắt đầu xem xét giấy giới thiệu."],
  ["Your note says","あなたのメモには","你的备注写着","Tu nota indica","Ghi chú của bạn cho biết"],
  ["The specialist office said","専門医療機関から聞いた内容","专科诊所表示","El consultorio especialista dijo","Phòng khám chuyên khoa cho biết"],
  ["The referring office said","紹介元から聞いた内容","转诊诊所表示","El consultorio que te refirió dijo","Nơi giới thiệu cho biết"],
  ["my note says","自分のメモには","我的备注写着","mi nota indica","ghi chú của tôi cho biết"],
  ["specialist office","専門医療機関","专科诊所","consultorio especialista","phòng khám chuyên khoa"],
  ["referring office","紹介元の医療機関","转诊诊所","consultorio que te refirió","nơi giới thiệu"],
  ["health plan","保険プラン","保险计划","plan de salud","chương trình bảo hiểm"],
  ["The specialist confirmed the referral can proceed to scheduling.", "専門医療機関は紹介状が予約手続きに進めることを確認しました。", "专科诊所确认转诊可以进入预约流程。", "El especialista confirmó que la referencia puede pasar a programación.", "Phòng khám chuyên khoa xác nhận giấy giới thiệu có thể chuyển sang bước đặt lịch."],
  ["You recorded that the specialist can proceed and known records or review steps are complete. Check any insurance requirements separately.", "専門医療機関が進行可能と確認し、把握している必要書類や審査が完了したと記録しました。保険の要件は別途確認してください。", "你记录了专科诊所确认可以继续，且已知资料或审核步骤已完成。请另行确认保险要求。", "Registraste que el especialista puede continuar y que los documentos o la revisión conocidos están completos. Revisa por separado los requisitos del seguro.", "Bạn đã ghi nhận phòng khám chuyên khoa có thể tiếp tục và hồ sơ hoặc bước xem xét đã biết đều hoàn tất. Hãy kiểm tra riêng các yêu cầu bảo hiểm."],
  ["This is based on a specialist-office confirmation you recorded.", "専門医療機関の確認としてあなたが記録した内容に基づいています。", "根据你记录的专科诊所确认信息。", "Se basa en la confirmación del consultorio especialista que registraste.", "Dựa trên xác nhận từ phòng khám chuyên khoa mà bạn đã ghi nhận."],
  ["Confirmed", "確認済み", "已确认", "Confirmado", "Đã xác nhận"],
  ["submit", "送信", "提交", "Enviar", "Gửi"],

  ["REFERRAL TOOLKIT", "紹介のサポート", "转诊工具包", "RECURSOS PARA TU REFERENCIA", "CÔNG CỤ HỖ TRỢ GIỚI THIỆU"],
  ["Who can help with the next step?", "次の手順は誰に相談できますか？", "下一步可以向谁求助？", "¿Quién puede ayudarte con el siguiente paso?", "Ai có thể giúp bạn ở bước tiếp theo?"],
  ["Referring office", "紹介元の医療機関", "转诊诊所", "Consultorio que te refirió", "Nơi giới thiệu"],
  ["Find contact details on your visit summary; ask when and where it was sent.", "診療後の案内で連絡先を確認し、いつどこへ送付されたか尋ねましょう。", "在就诊摘要中查找联系方式；询问何时发送以及发送至哪里。", "Busca los datos de contacto en el resumen de la visita; pregunta cuándo y a dónde la enviaron.", "Tìm thông tin liên hệ trong tóm tắt buổi khám; hỏi đã gửi khi nào và đến đâu."],
  ["Prepare a call script", "電話用スクリプトを準備", "准备通话脚本", "Preparar un guion para llamar", "Chuẩn bị kịch bản gọi điện"],
  ["Specialist office", "専門医療機関", "专科诊所", "Consultorio especialista", "Phòng khám chuyên khoa"],
  ["Use the referral paperwork or clinic directory to confirm receipt and scheduling steps.", "紹介状の書類や医療機関の一覧で連絡先を確認し、受領状況と予約方法を尋ねましょう。", "通过转诊资料或诊所目录联系专科诊所，确认是否收到以及如何预约。", "Usa los documentos de la referencia o el directorio de la clínica para confirmar la recepción y cómo programar.", "Dùng giấy tờ giới thiệu hoặc danh bạ phòng khám để xác nhận đã nhận và hỏi cách đặt lịch."],
  ["Health plan", "健康保険プラン", "健康保险计划", "Plan de salud", "Chương trình bảo hiểm"],
  ["Use member services on your insurance card or plan portal to check network and authorization.", "保険証の会員サービス電話番号や保険プランのポータルで、ネットワークと事前承認を確認しましょう。", "使用保险卡上的会员服务电话或保险计划门户查询网络状态和授权要求。", "Usa el número de servicios para miembros de tu tarjeta o el portal del plan para verificar la red y la autorización.", "Dùng số dịch vụ hội viên trên thẻ bảo hiểm hoặc cổng thông tin của chương trình để kiểm tra mạng lưới và phê duyệt."],
  ["These are questions to verify with each office or your health plan. Coverage and referral status are not checked automatically.", "各医療機関や健康保険プランに確認するための質問です。補償内容や紹介状の状況は自動確認されません。", "这些问题可向相关诊所或保险计划核实。系统不会自动查询保障范围或转诊状态。", "Son preguntas para confirmar con cada consultorio o tu plan de salud. La cobertura y el estado de la referencia no se verifican automáticamente.", "Đây là các câu hỏi để xác minh với phòng khám hoặc chương trình bảo hiểm. Ứng dụng không tự kiểm tra quyền lợi hay trạng thái giấy giới thiệu."],
  ["Add a referral to see questions tailored to your next step.", "紹介を追加すると、次の手順に合わせた質問が表示されます。", "添加转诊后即可查看符合下一步的问题。", "Agrega una referencia para ver preguntas según el siguiente paso.", "Thêm lượt giới thiệu để xem câu hỏi phù hợp với bước tiếp theo."],
  ["your health plan", "健康保険プラン", "你的健康保险计划", "tu plan de salud", "chương trình bảo hiểm của bạn"],
  ["Could you confirm whether you sent my referral and when it was sent?", "私の紹介状を送付したか、またいつ送付したか確認いただけますか？", "请确认是否已发送我的转诊，以及发送时间。", "¿Podrían confirmar si enviaron mi referencia y cuándo?", "Xin xác nhận đã gửi giấy giới thiệu của tôi chưa và gửi khi nào?"],
  ["Could you confirm whether you received my referral and tell me if anything else is needed before scheduling?", "私の紹介状を受領したか、予約前にほかに必要なものがあるか確認いただけますか？", "请确认是否收到我的转诊，并告知预约前是否还需要其他资料。", "¿Podrían confirmar si recibieron mi referencia y si falta algo antes de programar?", "Xin xác nhận đã nhận giấy giới thiệu của tôi chưa và tôi cần bổ sung gì trước khi đặt lịch?"],
  ["Is this specialist in my network, and does this visit need a referral or prior authorization?", "この専門医は保険ネットワーク内ですか？この受診には紹介状や事前承認が必要ですか？", "这位专科医生在我的保险网络内吗？此次就诊需要转诊或事先授权吗？", "¿Este especialista está dentro de mi red? ¿Necesito una referencia o autorización previa para esta consulta?", "Bác sĩ chuyên khoa này có trong mạng lưới của tôi không? Tôi có cần giấy giới thiệu hoặc phê duyệt trước cho lần khám này không？"],
  ["Record referral step", "紹介の進捗を記録", "记录转诊步骤", "Registrar el paso de la referencia", "Ghi lại bước giới thiệu"],
  ["Select to record", "選択して記録", "选择以记录", "Selecciona para registrar", "Chọn để ghi lại"],
  ["Starting point", "起点", "起始步骤", "Punto de partida", "Bước bắt đầu"],
  ["Draft format", "下書きの形式", "草稿格式", "Formato del borrador", "Định dạng bản nháp"],
  ["Referral activity, newest first", "紹介履歴（新しい順）", "转诊活动，最新在前", "Actividad de la referencia, de más reciente a más antigua", "Hoạt động giới thiệu, mới nhất trước"],
  ["Newest updates first", "新しい更新が上に表示されます", "最新更新显示在最上方", "Las actualizaciones más recientes aparecen primero", "Các cập nhật mới nhất hiển thị trước"],
  ["Add update", "更新を追加", "添加更新", "Añadir actualización", "Thêm cập nhật"],
  ["Enter a short summary before saving.", "保存する前に短い概要を入力してください。", "保存前请输入简短说明。", "Escribe un breve resumen antes de guardar.", "Nhập tóm tắt ngắn trước khi lưu."],
  ["Manage your language preference and the account that stores your referrals.", "言語設定と紹介情報を保存するアカウントを管理します。", "管理应用语言偏好和保存转诊信息的账户。", "Administra tu idioma preferido y la cuenta donde se guardan tus referencias.", "Quản lý ngôn ngữ ưu tiên và tài khoản lưu thông tin giới thiệu."],
  ["Language preference", "言語設定", "语言偏好", "Preferencia de idioma", "Tùy chọn ngôn ngữ"],
  ["Choose the language used across the app. It applies immediately and is saved as your default.", "アプリ全体で使用する言語を選択します。すぐに反映され、デフォルトとして保存されます。", "选择应用使用的语言。更改会立即生效并保存为默认语言。", "Elige el idioma de la aplicación. Se aplica de inmediato y se guarda como predeterminado.", "Chọn ngôn ngữ dùng trong ứng dụng. Ngôn ngữ được áp dụng ngay và lưu làm mặc định."],
  ["Changing the language updates app labels. It does not translate referral names or notes you entered.", "言語を変更するとアプリ内のラベルが変わります。入力した紹介先名やメモは翻訳されません。", "更改语言会更新应用标签，但不会翻译你输入的转诊名称或备注。", "Cambiar el idioma actualiza las etiquetas de la app. No traduce los nombres de referencias ni las notas que escribiste.", "Đổi ngôn ngữ sẽ cập nhật nhãn trong ứng dụng. Tên lượt giới thiệu và ghi chú bạn nhập sẽ không được dịch."],
  ["Your account", "アカウント", "你的账户", "Tu cuenta", "Tài khoản của bạn"],
  ["Signed in as", "ログイン中のアカウント", "当前登录账户", "Sesión iniciada como", "Đã đăng nhập với"],
  ["Account details unavailable", "アカウント情報を表示できません", "账户信息不可用", "Datos de la cuenta no disponibles", "Không có thông tin tài khoản"],
  ["Referral details are saved to this account. The app doesn’t contact offices or verify referral status or insurance coverage.", "紹介情報はこのアカウントに保存されます。アプリが医療機関に連絡したり、紹介状の状況や保険適用を確認したりすることはありません。", "转诊信息保存在此账户中。应用不会联系诊所，也不会核实转诊状态或保险范围。", "Los datos de la referencia se guardan en esta cuenta. La app no contacta consultorios ni verifica el estado de la referencia o la cobertura.", "Thông tin giới thiệu được lưu vào tài khoản này. Ứng dụng không liên hệ phòng khám hoặc xác minh trạng thái giới thiệu hay quyền lợi bảo hiểm."],
  ["Saving your preference…", "設定を保存しています…", "正在保存你的偏好…", "Guardando tu preferencia…", "Đang lưu tùy chọn…"],
  ["Saved in this browser only.", "このブラウザーにのみ保存しました。", "仅保存在此浏览器中。", "Guardado solo en este navegador.", "Chỉ lưu trên trình duyệt này."],
  ["Default language saved to your account.", "デフォルトの言語をアカウントに保存しました。", "默认语言已保存到你的账户。", "El idioma predeterminado se guardó en tu cuenta.", "Đã lưu ngôn ngữ mặc định vào tài khoản của bạn."],
  ["Couldn’t save your language. Please try again.", "言語を保存できませんでした。もう一度お試しください。", "无法保存语言设置，请重试。", "No se pudo guardar el idioma. Inténtalo de nuevo.", "Không thể lưu ngôn ngữ. Vui lòng thử lại."],
  ["Done", "完了", "完成", "Listo", "Xong"],
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
  const appointment = clean.match(/^You recorded an appointment for (.+)\.$/);
  if (appointment) {
    const dateText = translateText(appointment[1], language);
    return preserveWhitespace(source, {
      ja: `予約日として${dateText}を記録しました。`,
      zh: `你记录的预约日期为${dateText}。`,
      es: `Registraste una cita para el ${dateText}.`,
      vi: `Bạn đã ghi nhận lịch hẹn vào ngày ${dateText}.`,
    }[language]);
  }

  const appointmentTag = clean.match(/^Appointment · (.+)$/);
  if (appointmentTag) {
    const dateText = translateText(appointmentTag[1], language);
    return preserveWhitespace(source, {
      ja: `予約 · ${dateText}`,
      zh: `预约 · ${dateText}`,
      es: `Cita · ${dateText}`,
      vi: `Lịch hẹn · ${dateText}`,
    }[language]);
  }
  const timeTag = clean.match(/^Time · (.+)$/);
  if (timeTag) {
    return preserveWhitespace(source, {
      ja: `時間 · ${timeTag[1]}`,
      zh: `时间 · ${timeTag[1]}`,
      es: `Hora · ${timeTag[1]}`,
      vi: `Giờ · ${timeTag[1]}`,
    }[language]);
  }

  const dynamicText = [
    {
      pattern: /^(.+) may be needed before review\.$/,
      translate: (match: RegExpMatchArray) => {
        const item = translateText(match[1], language);
        return { ja: `審査前に${item}が必要な可能性があります。`, zh: `审核前可能需要${item}。`, es: `Es posible que se necesite ${item} antes de la revisión.`, vi: `Có thể cần ${item} trước khi xem xét.` }[language];
      },
    },
    {
      pattern: /^Ask (.+) to clarify the reason and what options, if any, are available\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に理由と、利用できる選択肢があるか確認してください。`, zh: `请向${m[1]}询问原因以及是否有可行方案。`, es: `Pide a ${m[1]} que aclare el motivo y las opciones disponibles, si las hay.`, vi: `Hãy hỏi ${m[1]} để làm rõ lý do và các lựa chọn nếu có.` }[language]),
    },
    {
      pattern: /^Ask (.+) what is needed to avoid a decline and whether the decision is final\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に、拒否を避けるために必要なことと、決定が最終かを確認してください。`, zh: `请询问${m[1]}需要什么才能避免拒绝，并确认决定是否已最终确定。`, es: `Pregunta a ${m[1]} qué hace falta para evitar el rechazo y si la decisión es definitiva.`, vi: `Hãy hỏi ${m[1]} cần bổ sung gì để tránh bị từ chối và quyết định đã là cuối cùng chưa.` }[language]),
    },
    {
      pattern: /^Ask (.+) what is missing and which office should provide it\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に、不足しているものと、どの医療機関が提供するのか確認してください。`, zh: `请询问${m[1]}缺少什么资料，以及应由哪家诊所提供。`, es: `Pregunta a ${m[1]} qué falta y qué consultorio debe proporcionarlo.`, vi: `Hãy hỏi ${m[1]} còn thiếu gì và phòng khám nào sẽ cung cấp.` }[language]),
    },
    {
      pattern: /^Ask (.+) whether the referral was sent to (.+)\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に、紹介状を${m[2]}へ送付したか確認してください。`, zh: `请向${m[1]}确认是否已将转诊发送给${m[2]}。`, es: `Pregunta a ${m[1]} si envió la referencia a ${m[2]}.`, vi: `Hãy hỏi ${m[1]} xem họ đã gửi giấy giới thiệu đến ${m[2]} chưa.` }[language]),
    },
    {
      pattern: /^Ask (.+) whether the referral arrived\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に紹介状が届いたか確認してください。`, zh: `请向${m[1]}确认是否收到转诊。`, es: `Pregunta a ${m[1]} si recibió la referencia.`, vi: `Hãy hỏi ${m[1]} xem đã nhận được giấy giới thiệu chưa.` }[language]),
    },
    {
      pattern: /^Ask (.+) whether the referral is under review and whether any records or other steps are still needed\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に、紹介状が確認中か、追加の記録や手順が必要か確認してください。`, zh: `请询问${m[1]}转诊是否正在审核，以及是否还需要资料或其他步骤。`, es: `Pregunta a ${m[1]} si está revisando la referencia y si aún hacen falta documentos u otros pasos.`, vi: `Hãy hỏi ${m[1]} liệu họ đang xem xét giấy giới thiệu và còn cần hồ sơ hay bước nào khác không.` }[language]),
    },
    {
      pattern: /^Contact (.+) to ask about appointment times\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に連絡して予約可能な日時を尋ねてください。`, zh: `联系${m[1]}询问可预约的时间。`, es: `Contacta con ${m[1]} para preguntar por los horarios disponibles.`, vi: `Liên hệ ${m[1]} để hỏi về thời gian hẹn còn trống.` }[language]),
    },
    {
      pattern: /^Ask (.+) to provide (.+) to (.+)\.$/,
      translate: (m: RegExpMatchArray) => {
        const item = translateText(m[2], language);
        return { ja: `${m[1]}に${item}を${m[3]}へ送るよう依頼してください。`, zh: `请让${m[1]}将${item}提供给${m[3]}。`, es: `Pide a ${m[1]} que envíe ${item} a ${m[3]}.`, vi: `Hãy đề nghị ${m[1]} gửi ${item} đến ${m[3]}.` }[language];
      },
    },
    {
      pattern: /^Check whether you have a copy of (.+) and ask (.+) how to provide it\.$/,
      translate: (m: RegExpMatchArray) => {
        const item = translateText(m[1], language);
        return { ja: `${item}のコピーがあるか確認し、${m[2]}に提出方法を尋ねてください。`, zh: `确认你是否有${item}的副本，并询问${m[2]}如何提交。`, es: `Comprueba si tienes una copia de ${item} y pregunta a ${m[2]} cómo entregarla.`, vi: `Kiểm tra xem bạn có bản sao ${item} không và hỏi ${m[2]} cách gửi.` }[language];
      },
    },
    {
      pattern: /^Ask (.+) what is needed and who should provide it\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に、何が必要で誰が用意するのか確認してください。`, zh: `请询问${m[1]}需要什么资料，以及应由谁提供。`, es: `Pregunta a ${m[1]} qué se necesita y quién debe proporcionarlo.`, vi: `Hãy hỏi ${m[1]} cần gì và ai sẽ cung cấp.` }[language]),
    },
    {
      pattern: /^Ask (.+) when it can be sent and whether anything is needed from you\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に、いつ送付できるか、あなたに必要なことがあるか尋ねてください。`, zh: `请询问${m[1]}何时可以发送，以及你是否需要提供任何资料。`, es: `Pregunta a ${m[1]} cuándo puede enviarla y si necesitan algo de ti.`, vi: `Hãy hỏi ${m[1]} khi nào có thể gửi và bạn có cần cung cấp gì không.` }[language]),
    },
    {
      pattern: /^Ask (.+) what is missing and which office should provide it\.$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}に、不足しているものと、どの医療機関が提供するのか確認してください。`, zh: `请询问${m[1]}缺少什么资料，以及应由哪家诊所提供。`, es: `Pregunta a ${m[1]} qué falta y qué consultorio debe proporcionarlo.`, vi: `Hãy hỏi ${m[1]} còn thiếu gì và phòng khám nào sẽ cung cấp.` }[language]),
    },
    {
      pattern: /^I recorded that my (.+) referral has not been sent yet\. Is anything needed from me, and when do you expect to send it to (.+)\?$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}の紹介状はまだ送付されていないと記録しました。私が対応することはありますか？また、いつ${m[2]}へ送付する予定ですか？`, zh: `我记录的${m[1]}转诊尚未发送。我需要提供什么吗？预计何时发送给${m[2]}？`, es: `Registré que aún no se ha enviado mi referencia de ${m[1]}. ¿Necesitan algo de mí y cuándo esperan enviarla a ${m[2]}?`, vi: `Tôi đã ghi nhận giấy giới thiệu ${m[1]} chưa được gửi. Tôi cần cung cấp gì không và khi nào dự kiến gửi đến ${m[2]}?` }[language]),
    },
    {
      pattern: /^Could you confirm whether you sent my (.+) referral to (.+)\? If not, is anything needed from me\?$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}の紹介状を${m[2]}へ送付したか確認していただけますか？まだの場合、私に必要なことはありますか？`, zh: `能否确认你们是否已将我的${m[1]}转诊发送给${m[2]}？如果还没有，我需要提供什么吗？`, es: `¿Podrían confirmar si enviaron mi referencia de ${m[1]} a ${m[2]}? Si no, ¿necesitan algo de mí?`, vi: `Bạn có thể xác nhận đã gửi giấy giới thiệu ${m[1]} của tôi đến ${m[2]} chưa không? Nếu chưa, tôi cần cung cấp gì?` }[language]),
    },
    {
      pattern: /^Could you confirm whether you received my (.+) referral from (.+), and whether anything else is needed before review\?$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[2]}から${m[1]}の紹介状を受け取りましたか？確認前に必要なものがあれば教えてください。`, zh: `能否确认你们是否收到${m[2]}转来的${m[1]}转诊？审核前还需要其他资料吗？`, es: `¿Podrían confirmar si recibieron de ${m[2]} mi referencia de ${m[1]} y si hace falta algo más antes de revisarla?`, vi: `Bạn có thể xác nhận đã nhận giấy giới thiệu ${m[1]} từ ${m[2]} chưa và trước khi xem xét còn cần gì không?` }[language]),
    },
    {
      pattern: /^I recorded that you received my (.+) referral\. Is it ready for review, and do you need any records or other information before it can proceed\?$/,
      translate: (m: RegExpMatchArray) => ({ ja: `${m[1]}の紹介状を受領したと記録しました。審査可能な状態ですか？進める前に必要な記録や情報はありますか？`, zh: `我记录了你们已收到我的${m[1]}转诊。现在可以审核了吗？继续前还需要哪些资料或信息？`, es: `Registré que recibieron mi referencia de ${m[1]}. ¿Está lista para revisión o necesitan documentos u otra información?`, vi: `Tôi đã ghi nhận bạn nhận được giấy giới thiệu ${m[1]} của tôi. Đã có thể xem xét chưa, hay cần thêm hồ sơ hoặc thông tin?` }[language]),
    },
    {
      pattern: /^Based on your note from the (.+); confirm who owns the next step\.$/,
      translate: (m: RegExpMatchArray) => ({
        ja: `${translateText(m[1], language)}から聞いた内容に基づいています。次の手順をどちらが担当するか確認してください。`,
        zh: `根据你记录的${translateText(m[1], language)}提供的信息；请确认下一步由谁负责。`,
        es: `Se basa en lo que registraste del ${translateText(m[1], language)}; confirma quién debe encargarse del siguiente paso.`,
        vi: `Dựa trên thông tin bạn ghi nhận từ ${translateText(m[1], language)}; hãy xác nhận ai phụ trách bước tiếp theo.`,
      }[language]),
    },
    {
      pattern: /^You recorded · (.+)$/,
      translate: (m: RegExpMatchArray) => ({
        ja: `あなたが記録 · ${translateText(m[1], language)}`,
        zh: `你记录 · ${translateText(m[1], language)}`,
        es: `Lo registraste · ${translateText(m[1], language)}`,
        vi: `Bạn đã ghi nhận · ${translateText(m[1], language)}`,
      }[language]),
    },
  ];

  for (const entry of dynamicText) {
    const match = clean.match(entry.pattern);
    if (match) return preserveWhitespace(source, entry.translate(match));
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

  const setLanguage = useCallback((next: AppLanguage) => {
    setLanguageState(next);
    try {
      localStorage.setItem("referral-navigator-language", next);
    } catch {
      // Language choice still applies for this session.
    }
  }, []);

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle({ onChange }: { onChange?: (language: AppLanguage) => void }) {
  const { language, setLanguage } = useAppLanguage();
  return (
    <label className="language-toggle">
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        value={language}
        onChange={(event) => {
          const next = event.target.value as AppLanguage;
          setLanguage(next);
          onChange?.(next);
        }}
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

function localizedQuestion(question: string, language: AppLanguage, specialty: string) {
  if (language === "en") return question;
  const common = question.toLowerCase();
  const byLanguage: Record<Exclude<AppLanguage, "en">, Record<string, string>> = {
    ja: {
      notSent: `記録では、${specialty}の紹介状はまだ送付されていません。私から必要なことはありますか？また、`,
      status: `私の${specialty}の紹介状を送付したか確認いただけますか？`,
      sent: `紹介状を受領したと記録しています。審査の準備はできていますか？必要な記録や情報があればお知らせください。`,
      received: `紹介状を受領したと記録しています。審査の準備はできていますか？必要な記録や情報があればお知らせください。`,
      prep: "予約の前に持参または準備すべきものはありますか？",
      completed: "先ほど相談した今後の手順と、いつ行えばよいかを教えていただけますか？",
      schedule: "予約可能な日時を教えていただけますか？",
      missing: "紹介状の審査に必要なものを教えていただけますか？必要書類の提出方法も確認したいです。",
      decline: "紹介状が却下される可能性があると記録しました。必要な情報と、最終決定かどうかを教えていただけますか？",
      declined: "紹介状が却下されたと記録しました。理由と、紹介元の医療機関に相談すべき次の手順を教えていただけますか？",
    },
    zh: {
      notSent: `我记录的情况是，我的${specialty}转诊尚未发送。我需要提供什么吗？预计何时发送给`,
      status: `请确认是否已将我的${specialty}转诊发送？`,
      sent: `我记录到你们已收到转诊。它可以开始审核了吗？审核前还需要其他资料吗？`,
      received: `我记录到你们已收到转诊。它可以开始审核了吗？审核前还需要其他资料吗？`,
      prep: "预约前我需要携带或准备什么吗？",
      completed: "请问我们讨论的后续步骤是什么，我应该何时完成？",
      schedule: "可以帮我看看有哪些预约时间吗？",
      missing: "我的转诊审核还需要哪些资料？请告知我应如何提交。",
      decline: "我记录到转诊可能会被拒绝。需要哪些信息？目前是最终决定吗？",
      declined: "我记录到转诊已被拒绝。请说明原因，以及我可以和转诊诊所讨论的后续步骤。",
    },
    es: {
      notSent: `Anoté que aún no se ha enviado mi referencia de ${specialty}. ¿Necesitan algo de mi parte? ¿Cuándo prevén enviarla a `,
      status: `¿Podrían confirmar si enviaron mi referencia de ${specialty}?`,
      sent: `Anoté que recibieron mi referencia de ${specialty}. ¿Está lista para revisión? ¿Necesitan algún otro documento o dato?`,
      received: `Anoté que recibieron mi referencia de ${specialty}. ¿Está lista para revisión? ¿Necesitan algún otro documento o dato?`,
      prep: "¿Debo llevar o preparar algo antes de la cita?",
      completed: "¿Podrían aclararme los pasos de seguimiento que hablamos y cuándo debo realizarlos?",
      schedule: "¿Podrían ayudarme a encontrar una fecha para la cita?",
      missing: "¿Podrían indicarme qué información falta para revisar mi referencia y cómo debo enviarla?",
      decline: "Anoté que podrían rechazar mi referencia. ¿Qué información necesitan y ya tomaron una decisión final?",
      declined: "Anoté que rechazaron mi referencia. ¿Podrían explicarme el motivo y los próximos pasos que debo consultar con el consultorio que me refirió?",
    },
    vi: {
      notSent: `Tôi ghi nhận giấy giới thiệu đến khoa ${specialty} chưa được gửi. Tôi cần cung cấp gì không? Khi nào dự kiến gửi đến `,
      status: `Quý vị có thể xác nhận đã gửi giấy giới thiệu đến khoa ${specialty} chưa?`,
      sent: `Tôi ghi nhận quý vị đã nhận giấy giới thiệu đến khoa ${specialty}. Hồ sơ đã sẵn sàng xem xét chưa? Có cần thêm giấy tờ hoặc thông tin nào không?`,
      received: `Tôi ghi nhận quý vị đã nhận giấy giới thiệu đến khoa ${specialty}. Hồ sơ đã sẵn sàng xem xét chưa? Có cần thêm giấy tờ hoặc thông tin nào không?`,
      prep: "Tôi cần mang theo hoặc chuẩn bị gì trước cuộc hẹn không?",
      completed: "Xin cho biết các bước tiếp theo chúng ta đã trao đổi và khi nào tôi nên thực hiện.",
      schedule: "Quý vị có thể giúp tôi tìm thời gian hẹn khám không?",
      missing: "Hồ sơ giới thiệu của tôi còn thiếu thông tin gì để được xem xét? Xin cho biết cách gửi thông tin đó.",
      decline: "Tôi ghi nhận giấy giới thiệu có thể bị từ chối. Cần bổ sung thông tin gì và đây đã là quyết định cuối cùng chưa?",
      declined: "Tôi ghi nhận giấy giới thiệu đã bị từ chối. Xin giải thích lý do và các bước tiếp theo tôi nên trao đổi với nơi giới thiệu.",
    },
  };
  const t = byLanguage[language];
  if (/what do i need before scheduling|what do i need before i can schedule/.test(common)) {
    return ({
      ja: "予約前に必要なものを教えていただけますか？",
      zh: "请问预约前还需要我准备什么？",
      es: "¿Qué necesito antes de programar la cita?",
      vi: "Tôi cần chuẩn bị gì trước khi đặt lịch?",
    }[language]);
  }
  if (/may be declined|might be declined|could be declined/.test(common)) return t.decline;
  if (/referral was declined/.test(common)) return t.declined;
  if (/has not been sent yet/.test(common)) return t.notSent + question.split(" to ").pop();
  if (/could you confirm whether you received/.test(common)) return t.sent;
  if (/i recorded that you received my/.test(common)) return t.received;
  if (/anything i should bring or do before my appointment/.test(common)) return t.prep;
  if (/clarify the follow-up steps/.test(common)) return t.completed;
  if (/help me find an appointment time/.test(common)) return t.schedule;
  if (/is needed|which item is required|what is still needed/.test(common)) {
    const item = question.match(/(?:said|recorded that)\s+(.+?)\s+is needed/i)?.[1] ?? question.match(/(.+?)\s+is needed/i)?.[1]?.replace(/^.*(?:said|recorded that)\s+/i, "");
    if (item) {
      const localizedItem = translateText(item, language);
      if (language === "ja") return `${localizedItem}が必要とのことです。どのように提出すればよいか教えていただき、提出後に確認いただけますか？`;
      if (language === "zh") return `据悉需要${localizedItem}。请告知我应如何提交，并在收到后予以确认。`;
      if (language === "es") return `Me indicaron que se necesita ${localizedItem}. ¿Podrían decirme cómo enviarlo y confirmar cuando lo reciban?`;
      return `Tôi được thông báo cần có ${localizedItem}. Xin cho biết cách gửi và xác nhận khi đã nhận được.`;
    }
    return t.missing;
  }
  if (/ready to schedule/.test(common)) return t.schedule;
  if (/could you confirm whether you sent my/.test(common)) return t.status;
  return translateText(question, language);
}

export function localizedDraft(
  language: AppLanguage,
  kind: "Call script" | "Text message" | "Portal message" | "Email",
  recipient: string,
  specialty: string,
  question: string,
) {
  const localizedSpecialty = language === "en" ? specialty : translateText(specialty, language);
  const localizedPrompt = localizedQuestion(question, language, localizedSpecialty);
  if (language === "en") {
    if (kind === "Call script") {
      return `Hello, my name is [your name]. I’m calling ${recipient} about my ${localizedSpecialty} referral. ${question} Could you repeat the next step and let me know who I should speak with? Thank you.`;
    }
    if (kind === "Text message") {
      return `Hi, this is [your name]. I’m following up with ${recipient} about my ${localizedSpecialty} referral. ${question} Thank you, [your name].`;
    }
    if (kind === "Portal message") {
      return `Hello, I’m following up about my ${localizedSpecialty} referral. ${question} Please let me know if you need anything else from me. Thank you, [your name].`;
    }
    return `Hello, I’m writing to follow up on my ${localizedSpecialty} referral with ${recipient}. ${question} Please let me know if any additional information is needed. Thank you, [your name].`;
  }

  const prompts: Record<Exclude<AppLanguage, "en">, Record<string, string>> = {
    ja: {
      call: `こんにちは、[お名前]です。${recipient}に、${localizedSpecialty}の紹介状についてお電話しています。${localizedPrompt}次の手順をもう一度教えていただき、どなたに相談すればよいかお知らせください。ありがとうございます。`,
      text: `こんにちは、[お名前]です。${recipient}に${localizedSpecialty}の紹介状について確認しています。${localizedPrompt}よろしくお願いいたします。[お名前]`,
      portal: `こんにちは。${localizedSpecialty}の紹介状について確認のためご連絡しました。${localizedPrompt}ほかに必要な情報があればお知らせください。よろしくお願いいたします。[お名前]`,
      email: `こんにちは。${recipient}宛てに、${localizedSpecialty}の紹介状についてお問い合わせします。${localizedPrompt}追加情報が必要な場合はお知らせください。よろしくお願いいたします。[お名前]`,
    },
    zh: {
      call: `您好，我是[姓名]。我致电${recipient}，想跟进我的${localizedSpecialty}转诊。${localizedPrompt}请您再说明一下下一步，并告诉我应该联系谁。谢谢。`,
      text: `您好，我是[姓名]。我想跟进${recipient}处我的${localizedSpecialty}转诊。${localizedPrompt}谢谢！[姓名]`,
      portal: `您好，我想跟进我的${localizedSpecialty}转诊。${localizedPrompt}如需我提供其他信息，请告知。谢谢！[姓名]`,
      email: `您好，我写信想跟进${recipient}处我的${localizedSpecialty}转诊。${localizedPrompt}如需补充资料，请告知。谢谢！[姓名]`,
    },
    es: {
      call: `Hola, me llamo [tu nombre]. Llamo a ${recipient} para dar seguimiento a mi referencia de ${localizedSpecialty}. ${localizedPrompt}¿Podrían repetir el siguiente paso e indicarme con quién debo hablar? Gracias.`,
      text: `Hola, soy [tu nombre]. Doy seguimiento con ${recipient} a mi referencia de ${localizedSpecialty}. ${localizedPrompt} Gracias. [Tu nombre]`,
      portal: `Hola, escribo para dar seguimiento a mi referencia de ${localizedSpecialty}. ${localizedPrompt} Avísenme si necesitan algún otro dato. Gracias. [Tu nombre]`,
      email: `Hola, escribo a ${recipient} para dar seguimiento a mi referencia de ${localizedSpecialty}. ${localizedPrompt} Por favor, avísenme si necesitan información adicional. Gracias. [Tu nombre]`,
    },
    vi: {
      call: `Xin chào, tôi tên là [tên của bạn]. Tôi gọi cho ${recipient} để hỏi về giấy giới thiệu đến khoa ${localizedSpecialty} của tôi. ${localizedPrompt}Xin vui lòng nhắc lại bước tiếp theo và cho tôi biết nên trao đổi với ai. Cảm ơn.`,
      text: `Xin chào, tôi là [tên của bạn]. Tôi liên hệ với ${recipient} để hỏi về giấy giới thiệu đến khoa ${localizedSpecialty}. ${localizedPrompt} Xin cảm ơn. [Tên của bạn]`,
      portal: `Xin chào, tôi liên hệ để hỏi về giấy giới thiệu đến khoa ${localizedSpecialty}. ${localizedPrompt} Xin cho biết nếu cần tôi cung cấp thêm thông tin. Xin cảm ơn. [Tên của bạn]`,
      email: `Xin chào, tôi viết thư để hỏi ${recipient} về giấy giới thiệu đến khoa ${localizedSpecialty}. ${localizedPrompt} Xin cho biết nếu cần thêm thông tin. Xin cảm ơn. [Tên của bạn]`,
    },
  };
  const localized = prompts[language];
  return kind === "Call script" ? localized.call
    : kind === "Text message" ? localized.text
      : kind === "Portal message" ? localized.portal
        : localized.email;
}
