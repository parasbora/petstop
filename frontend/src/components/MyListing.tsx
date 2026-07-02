import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMeQuery } from "@/api/authApi";
import {
  useGetPetSitterProfileQuery,
  useUpdatePetSitterMutation,
  useCreatePetSitterMutation,
} from "@/api/petApi";

type ProfileDTO = {
  name?: string;
  bio?: string | null;
  location?: string;
  hourlyRate?: number | null;
  experience?: number | null;
  serviceTypes?: string[];
  petTypes?: string[];
};

type FormState = {
  name: string;
  location: string;
  hourlyRate: string;
  experience: string;
  bio: string;
  petTypes: string[];
  services: string;
};

const PET_OPTIONS: { value: string; label: string }[] = [
  { value: "dog", label: "🐶 Dogs" },
  { value: "cat", label: "🐱 Cats" },
];

const inputCls =
  "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {label}
    </label>
    {children}
  </div>
);

const EMPTY_FORM: FormState = {
  name: "",
  location: "",
  hourlyRate: "",
  experience: "",
  bio: "",
  petTypes: [],
  services: "",
};

const toForm = (p: ProfileDTO): FormState => ({
  name: p.name ?? "",
  location: p.location ?? "",
  hourlyRate: p.hourlyRate != null ? String(p.hourlyRate) : "",
  experience: p.experience != null ? String(p.experience) : "",
  bio: p.bio ?? "",
  petTypes: p.petTypes ?? [],
  services: (p.serviceTypes ?? []).join(", "),
});

export default function ListingLocationSection() {
  const { data: me } = useGetMeQuery();
  const petSitterId = me?.petSitterId;
  const isSitter = !!petSitterId;

  const { data: profile, isLoading } = useGetPetSitterProfileQuery(
    { id: String(petSitterId) },
    { skip: !petSitterId },
  );
  const [updatePetSitter, { isLoading: saving }] = useUpdatePetSitterMutation();
  const [createPetSitter, { isLoading: creating }] = useCreatePetSitterMutation();
  const busy = saving || creating;

  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (profile) setForm(toForm(profile as ProfileDTO));
    else if (!petSitterId) setForm(EMPTY_FORM);
  }, [profile, petSitterId]);

  // Existing sitter, profile still loading
  if (isSitter && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!form) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const togglePet = (value: string) =>
    set(
      "petTypes",
      form.petTypes.includes(value)
        ? form.petTypes.filter((p) => p !== value)
        : [...form.petTypes, value],
    );

  const reset = () => profile && setForm(toForm(profile as ProfileDTO));

  const save = async () => {
    const trimmedBio = form.bio.trim();
    if (form.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (form.location.trim().length < 2) {
      toast.error("Please enter a location");
      return;
    }
    if (trimmedBio && trimmedBio.length < 10) {
      toast.error("Bio must be at least 10 characters (or leave it empty)");
      return;
    }

    const data: Record<string, unknown> = {
      name: form.name.trim(),
      location: form.location.trim(),
      bio: trimmedBio || undefined,
      hourlyRate: form.hourlyRate === "" ? undefined : Number(form.hourlyRate),
      experience: form.experience === "" ? undefined : Number(form.experience),
      petTypes: form.petTypes,
      serviceTypes: form.services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (isSitter) {
        await updatePetSitter({ id: petSitterId, data }).unwrap();
        toast.success("Listing updated");
      } else {
        await createPetSitter(data).unwrap();
        toast.success("You're now a pet sitter! 🎉");
      }
    } catch (err) {
      const msg = (err as { data?: { error?: string } })?.data?.error || "Could not save listing";
      toast.error(msg);
    }
  };

  const serviceTags = form.services
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {isSitter ? "My listing" : "Become a pet sitter"}
        </h2>
        {isSitter && (
          <Link to={`/sitter-profile/${petSitterId}`}>
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
              View public profile
            </Button>
          </Link>
        )}
      </div>

      {!isSitter && (
        <p className="-mt-4 text-sm text-muted-foreground">
          Fill in your details to list your services and start receiving bookings.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Display name">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
          />
        </Field>

        <Field label="Location">
          <input
            className={inputCls}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="City / area"
          />
        </Field>

        <Field label="Hourly rate (₹)">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className={inputCls}
            value={form.hourlyRate}
            onChange={(e) => set("hourlyRate", e.target.value)}
            placeholder="e.g. 250"
          />
        </Field>

        <Field label="Experience (years)">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className={inputCls}
            value={form.experience}
            onChange={(e) => set("experience", e.target.value)}
            placeholder="e.g. 3"
          />
        </Field>
      </div>

      <Field label="Pets you sit">
        <div className="flex flex-wrap gap-2 pt-1">
          {PET_OPTIONS.map((opt) => {
            const active = form.petTypes.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => togglePet(opt.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Services offered">
        <input
          className={inputCls}
          value={form.services}
          onChange={(e) => set("services", e.target.value)}
          placeholder="dog walking, overnight stays, grooming"
        />
        <p className="text-xs text-muted-foreground">Separate services with commas.</p>
        {serviceTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {serviceTags.map((tag) => (
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

      <Field label="About / bio">
        <textarea
          rows={4}
          maxLength={500}
          className={`${inputCls} resize-none`}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Tell pet owners about your experience and what makes you a great sitter…"
        />
      </Field>

      <div className="flex flex-wrap gap-2 border-t border-border pt-6">
        <Button onClick={save} disabled={busy} className="rounded-full px-6">
          {isSitter
            ? saving
              ? "Saving…"
              : "Save changes"
            : creating
              ? "Creating…"
              : "Create sitter profile"}
        </Button>
        {isSitter && (
          <Button onClick={reset} variant="outline" disabled={busy} className="rounded-full px-6">
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
