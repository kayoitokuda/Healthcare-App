import { Check, ClipboardList, HeartHandshake, House, MessageCircle, Phone, Plus } from 'lucide-react'
import { Badge, Button, Collapse, Field, Popover, Roll, Stage, Window, type Act } from '../../kit'
import './referral-update.css'

// Referral Navigator: a patient records what the referring office told them.
// The update lands in the journey, the status pill and the suggested next
// step change in place. Nothing is sent anywhere; the patient keeps the record.

type S = {
  open: boolean
  typed: string
  focused: boolean
  sent: boolean
  source: boolean
  saved: boolean
  fade: boolean
}

const initial: S = { open: false, typed: '', focused: false, sent: false, source: false, saved: false, fade: false }
const NOTE = 'Office said they faxed it today'
const POSTER: S = { ...initial, saved: true, sent: true, source: true, typed: NOTE }

const REST = { wide: { x: 600, y: 300 }, compact: { x: 300, y: 300 } }

async function script(a: Act<S>) {
  await a.wait(700)

  // 1. Open the recorder from the suggested next step
  await a.click('record')
  await a.set({ open: true })
  await a.wait(350)

  // 2. Write down what was heard
  await a.click('note')
  await a.set({ focused: true })
  await a.type('typed', NOTE)
  await a.wait(300)

  // 3. Mark the step and who it came from
  await a.click('chip-sent')
  await a.set({ sent: true, focused: false })
  await a.wait(250)
  await a.click('chip-office')
  await a.set({ source: true })
  await a.wait(350)

  // 4. Save: the record lands, then status and next step follow
  await a.click({ at: 'save', x: 0.88, y: 0.75 })
  await a.set({ open: false })
  await a.wait(150)
  await a.set({ saved: true })
  a.move('rest')
  await a.wait(3200)

  // Reset behind a short fade, so nothing rewinds in view
  await a.set({ fade: true })
  await a.wait(320)
  await a.snap({ ...initial, fade: true })
  await a.wait(60)
  await a.set({ fade: false })
  await a.wait(600)
}

export function ReferralUpdate() {
  return (
    <Stage
      width={720}
      height={400}
      compact={{ below: 600, width: 358, height: 350 }}
      initial={initial}
      poster={POSTER}
      script={script}
      cursor={{ at: REST }}
      className="rn"
    >
      {(s, _rect, layout) => (
        <>
          <Window className="rn-window" receded={s.open}>
            <div className="rn-app">
            {layout === 'wide' && <Sidebar />}
            <div className="rn-main" data-fade={s.fade || undefined}>
              <div className="rn-eyebrow">Your referral</div>
              <div className="rn-titlerow">
                <div className="rn-title">Oral surgery</div>
                <Badge className="rn-status" tone={s.saved ? 'accent' : 'warning'} dot>
                  <Roll delay={350}>{s.saved ? 'Sent · awaiting receipt' : 'Not confirmed yet'}</Roll>
                </Badge>
              </div>
              <div className="rn-route">
                Bayview Dental <span className="rn-arrow">→</span> Peninsula Oral Surgery
              </div>

              <div className="rn-card">
                <div className="rn-card-head" hidden>
                  <div className="rn-eyebrow">The handoff</div>
                  <div className="rn-h2">Your referral journey</div>
                </div>

                <div className="rn-next">
                  <span className="rn-next-ring" />
                  <div className="rn-next-body">
                    <div className="rn-next-label">Up next · a possible next step</div>
                    <div className="rn-next-title">
                      <Roll delay={700}>{s.saved ? 'Confirm the specialist received it' : 'Check whether it was sent'}</Roll>
                    </div>
                    <div className="rn-next-actions">
                      <Button className="rn-btn rn-btn--secondary" icon={<Plus size={14} strokeWidth={2.25} />} data-target="record" data-cursor="pointer" data-open={s.open || undefined}>
                        Record an update
                      </Button>
                      {layout === 'wide' && (
                        <Button className="rn-btn rn-btn--primary" variant="primary" icon={<Phone size={14} strokeWidth={2.25} />}>
                          Prepare a call script
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rn-timeline">
                  <Collapse open={s.saved} reveal="drop">
                    <Event date="Nov 6, 2026" title="Referral sent" tag="Referring office" note={layout === 'wide' ? NOTE : undefined} fresh />
                  </Collapse>
                  <Event date="Sep 10, 2026" title="Recommendation" tag="Starting point · You entered this" />
                </div>
              </div>
            </div>
            </div>
          </Window>

          <Popover show={s.open} className="rn-pop" origin="center">
            <div className="rn-pop-title">Record an update</div>
            <Field
              className="rn-field"
              label="What happened?"
              value={s.typed}
              placeholder="e.g. Called to ask if it was sent"
              focused={s.focused}
              box={{ 'data-target': 'note', 'data-cursor': 'ibeam' }}
            />
            <div className="rn-pop-label">Referral steps you know happened</div>
            <div className="rn-chips">
              <span className="rn-chip" data-on={s.sent || undefined} data-target="chip-sent" data-cursor="pointer">
                <Check className="rn-chip-tick" size={12} strokeWidth={2.5} />
                Referral sent
              </span>
              <span className="rn-chip">Referral received</span>
            </div>
            <div className="rn-pop-label">Who did this come from?</div>
            <div className="rn-chips">
              <span className="rn-chip">You</span>
              <span className="rn-chip" data-on={s.source || undefined} data-target="chip-office" data-cursor="pointer">
                <Check className="rn-chip-tick" size={12} strokeWidth={2.5} />
                Referring office
              </span>
            </div>
            <div className="rn-pop-foot">
              <Button className="rn-btn rn-btn--primary" variant="primary" data-target="save" data-cursor="pointer">
                Save update
              </Button>
            </div>
          </Popover>

          <span data-target="rest" style={{ position: 'absolute', left: REST[layout].x, top: REST[layout].y }} />
        </>
      )}
    </Stage>
  )
}

function Sidebar() {
  return (
    <div className="rn-side">
      <div className="rn-brand">
        <span className="rn-logo">
          <HeartHandshake size={14} strokeWidth={2.25} />
        </span>
        <span className="rn-wordmark">Referral Navigator</span>
      </div>
      <div className="rn-nav">
        <span className="rn-nav-item">
          <House size={14} strokeWidth={2} /> Overview
        </span>
        <span className="rn-nav-item" data-on>
          <ClipboardList size={14} strokeWidth={2} /> My referrals
        </span>
        <span className="rn-nav-item">
          <MessageCircle size={14} strokeWidth={2} /> Next steps
        </span>
      </div>
    </div>
  )
}

function Event({ date, title, tag, note, fresh }: { date: string; title: string; tag: string; note?: string; fresh?: boolean }) {
  return (
    <div className="rn-event" data-fresh={fresh || undefined}>
      <span className="rn-event-dot">
        <Check size={10} strokeWidth={3} />
      </span>
      <div className="rn-event-body">
        <div className="rn-event-date">{date}</div>
        <div className="rn-event-title">{title}</div>
        {note && <div className="rn-event-note">“{note}”</div>}
        <span className="rn-tag">{tag}</span>
      </div>
    </div>
  )
}
