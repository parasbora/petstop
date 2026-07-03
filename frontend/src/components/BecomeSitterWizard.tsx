import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCreatePetSitterMutation } from '@/api/petApi'

type FormState = {
  name: string
  location: string
  experience: string
  petTypes: string[]
  services: string
  hourlyRate: string
  bio: string
}

const EMPTY: FormState = {
  name: '',
  location: '',
  experience: '',
  petTypes: [],
  services: '',
  hourlyRate: '',
  bio: '',
}

const STEPS = ['Basics', 'Services & pets', 'Rate & bio'] as const

const PET_OPTIONS = [
  { value: 'dog', label: '🐶 Dogs' },
  { value: 'cat', label: '🐱 Cats' },
]

const inputCls =
  'w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground'

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</label>
    {children}
  </div>
)

export default function BecomeSitterWizard() {
  const [createPetSitter, { isLoading }] = useCreatePetSitterMutation()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const togglePet = (value: string) =>
    set('petTypes', form.petTypes.includes(value) ? form.petTypes.filter((p) => p !== value) : [...form.petTypes, value])

  const services = form.services
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  // Returns true if the current step's fields are valid.
  const validateStep = (): boolean => {
    if (step === 0) {
      const name = form.name.trim()
      const location = form.location.trim()
      if (name.length < 2 || name.length > 50) {
        toast.error('Name must be between 2 and 50 characters')
        return false
      }
      if (location.length < 2 || location.length > 100) {
        toast.error('Location must be between 2 and 100 characters')
        return false
      }
      if (form.experience !== '' && (Number(form.experience) < 0 || Number(form.experience) > 60)) {
        toast.error('Experience must be between 0 and 60 years')
        return false
      }
    }
    if (step === 1) {
      if (services.length > 10) {
        toast.error('You can list up to 10 services')
        return false
      }
      if (services.some((s) => s.length > 30)) {
        toast.error('Each service name must be 30 characters or fewer')
        return false
      }
    }
    if (step === 2) {
      const bio = form.bio.trim()
      if (form.hourlyRate !== '' && (Number(form.hourlyRate) < 0 || Number(form.hourlyRate) > 5000)) {
        toast.error('Hourly rate must be between ₹0 and ₹5000')
        return false
      }
      if (bio && bio.length < 10) {
        toast.error('Bio must be at least 10 characters (or leave it empty)')
        return false
      }
    }
    return true
  }

  const next = () => validateStep() && setStep((s) => s + 1)
  const back = () => setStep((s) => Math.max(0, s - 1))

  const submit = async () => {
    if (!validateStep()) return
    const data: Record<string, unknown> = {
      name: form.name.trim(),
      location: form.location.trim(),
      bio: form.bio.trim() || undefined,
      hourlyRate: form.hourlyRate === '' ? undefined : Number(form.hourlyRate),
      experience: form.experience === '' ? undefined : Number(form.experience),
      petTypes: form.petTypes,
      serviceTypes: services,
    }
    try {
      await createPetSitter(data).unwrap()
      toast.success("You're now a pet sitter! 🎉")
    } catch (err) {
      const msg = (err as { data?: { error?: string } })?.data?.error || 'Could not create sitter profile'
      toast.error(msg)
    }
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-foreground' : 'bg-border'}`}
            />
          ))}
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      {/* Step 1: Basics */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Display name">
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your name"
                maxLength={50}
              />
            </Field>
            <Field label="Location">
              <input
                className={inputCls}
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="City / area"
                maxLength={100}
              />
            </Field>
          </div>
          <Field label="Experience (years)">
            <input
              type="number"
              min={0}
              max={60}
              inputMode="numeric"
              className={inputCls}
              value={form.experience}
              onChange={(e) => set('experience', e.target.value)}
              placeholder="e.g. 3"
            />
          </Field>
        </div>
      )}

      {/* Step 2: Services & pets */}
      {step === 1 && (
        <div className="space-y-5">
          <Field label="Pets you sit">
            <div className="flex flex-wrap gap-2 pt-1">
              {PET_OPTIONS.map((opt) => {
                const active = form.petTypes.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => togglePet(opt.value)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                      active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </Field>
          <Field label="Services offered">
            <input
              className={inputCls}
              value={form.services}
              onChange={(e) => set('services', e.target.value)}
              placeholder="dog walking, overnight stays, grooming"
            />
            <p className="text-xs text-muted-foreground">
              Separate services with commas. Up to 10 services, 30 characters each.
            </p>
            {services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {services.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs capitalize text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Field>
        </div>
      )}

      {/* Step 3: Rate & bio */}
      {step === 2 && (
        <div className="space-y-5">
          <Field label="Hourly rate (₹)">
            <input
              type="number"
              min={0}
              max={5000}
              inputMode="numeric"
              className={inputCls}
              value={form.hourlyRate}
              onChange={(e) => set('hourlyRate', e.target.value)}
              placeholder="e.g. 250"
            />
          </Field>
          <Field label="About / bio">
            <textarea
              rows={4}
              maxLength={500}
              className={`${inputCls} resize-none`}
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Tell pet owners about your experience and what makes you a great sitter…"
            />
          </Field>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button
          variant="ghost"
          onClick={back}
          disabled={step === 0}
          className="rounded-full px-5 text-muted-foreground hover:text-foreground disabled:opacity-0"
        >
          Back
        </Button>
        {isLastStep ? (
          <Button onClick={submit} disabled={isLoading} className="rounded-full px-6">
            {isLoading ? 'Creating…' : 'Create sitter profile'}
          </Button>
        ) : (
          <Button onClick={next} className="rounded-full px-6">
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
