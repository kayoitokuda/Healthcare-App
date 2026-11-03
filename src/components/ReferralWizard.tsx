import { useEffect, useRef, useState, type FormEvent } from 'react';

type Props = {
  editing: boolean;
  values: string[];
  onChange: (index: number, value: string) => void;
  offices: string[];
  onSave: (event: FormEvent) => void;
};

export default function ReferralWizard({ editing, values, onChange, offices, onSave }: Props) {
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const questions = ['What specialist care was recommended?', 'Who recommended it?', 'Which specialist office?', 'When was it recommended?'];
  const labels = ['Specialty or reason', 'Referring office', 'Specialist office', 'Date recommended'];
  const count = editing ? 3 : 4;
  const reviewing = step === count;
  useEffect(() => { heading.current?.focus(); }, [step]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reviewing) onSave(event);
    else if (step > 0 || values[0].trim()) setStep(step + 1);
  }
  return <form className="form-body referral-wizard" onSubmit={submit}>
    <p className="wizard-progress" aria-live="polite">{reviewing ? 'Review your referral' : `Question ${step + 1} of ${count}`}</p>
    <progress max={count + 1} value={step + 1} aria-label="Referral entry progress" />
    <h2 ref={heading} tabIndex={-1}>{reviewing ? 'Does this look right?' : questions[step]}</h2>
    <p className="modal-intro">{reviewing ? 'You can change these details later. Saving does not contact an office.' : step === 0 ? 'Use the specialty or reason your clinician gave you.' : 'Add what you know. You can leave this blank and fill it in later.'}</p>
    {reviewing ? <dl className="wizard-review">{labels.slice(0, count).map((label, index) => <div key={label}><dt>{label}</dt><dd>{values[index] || 'Not added'}<button type="button" className="text-button" onClick={() => setStep(index)} aria-label={`Edit ${label.toLowerCase()}`}>Edit</button></dd></div>)}</dl> : <div key={step} className="wizard-question">
      <label>{labels[step]}<input type={step === 3 ? 'date' : 'text'} value={values[step]} required={step === 0} onChange={event => onChange(step, event.target.value)} placeholder={step === 0 ? 'e.g. Cardiology' : 'Clinic or clinician name'} /></label>
      {(step === 1 || step === 2) && offices.length > 0 && <div className="wizard-options" role="group" aria-label="Previously used offices">{offices.map(office => <button className="secondary-button" type="button" key={office} aria-pressed={values[step] === office} onClick={() => onChange(step, office)}>{office}</button>)}</div>}
      {step > 0 && <button className="text-button wizard-skip" type="button" onClick={() => { onChange(step, ''); setStep(step + 1); }}>I’m not sure — add later</button>}
    </div>}
    <div className="wizard-actions">{step > 0 && <button className="secondary-button" type="button" onClick={() => setStep(step - 1)}>Back</button>}<button className="primary-button" type="submit" disabled={step === 0 && !values[0].trim()}>{reviewing ? editing ? 'Save changes' : 'Add to my referrals' : 'Continue'}</button></div>
    <p className="helper-note">Your updates are recorded by you. The app does not check clinic systems.</p>
  </form>;
}
