import { useState } from 'react'
import { toast } from 'sonner'
import { PawPrint, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BREEDS_BY_SPECIES } from '@/lib/breeds'
import {
  useGetMyPetsQuery,
  useCreatePetMutation,
  useDeletePetMutation,
  type PetSpecies,
} from '@/api/petsApi'

const inputCls =
  'w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground'

const SPECIES_EMOJI: Record<PetSpecies, string> = { dog: '🐶', cat: '🐱' }

function AddPetForm({ onDone }: { onDone: () => void }) {
  const [createPet, { isLoading }] = useCreatePetMutation()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<PetSpecies>('dog')
  const [breed, setBreed] = useState('')
  const [age, setAge] = useState('')

  const breedOptions = BREEDS_BY_SPECIES[species]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 1) {
      toast.error('Please enter a name')
      return
    }
    if (!breed) {
      toast.error('Please select a breed')
      return
    }
    const ageNum = Number(age)
    if (!age || !Number.isFinite(ageNum) || ageNum < 0) {
      toast.error('Please enter a valid age')
      return
    }

    try {
      await createPet({ name: name.trim(), species, breed, age: ageNum }).unwrap()
      toast.success('Pet added')
      onDone()
    } catch (err) {
      const msg = (err as { data?: string })?.data || 'Could not add pet'
      toast.error(msg)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-border p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Name
          </label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pet's name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Age (years)
          </label>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className={inputCls}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Species
          </label>
          <Select
            value={species}
            onValueChange={(v) => {
              setSpecies(v as PetSpecies)
              setBreed('')
            }}
          >
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">Dog</SelectItem>
              <SelectItem value="cat">Cat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Breed
          </label>
          <Select value={breed} onValueChange={setBreed}>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Select breed" />
            </SelectTrigger>
            <SelectContent>
              {breedOptions.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="rounded-full px-5" size="sm">
          {isLoading ? 'Adding…' : 'Add pet'}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} className="rounded-full px-5" size="sm">
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function PetsSection() {
  const { data: pets, isLoading } = useGetMyPetsQuery()
  const [deletePet] = useDeletePetMutation()
  const [showForm, setShowForm] = useState(false)

  const remove = async (id: number) => {
    try {
      await deletePet(id).unwrap()
      toast.success('Pet removed')
    } catch (err) {
      const msg = (err as { data?: string })?.data || 'Could not remove pet'
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="pt-2">
      {pets && pets.length > 0 && (
        <div className="mb-6 divide-y divide-border">
          {pets.map((pet) => (
            <div key={pet.id} className="flex items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {SPECIES_EMOJI[pet.species]} {pet.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pet.breed} · {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                </p>
              </div>
              <button
                onClick={() => remove(pet.id)}
                className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${pet.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <AddPetForm onDone={() => setShowForm(false)} />
      ) : pets && pets.length > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(true)}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add another pet
        </Button>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <PawPrint className="mb-4 h-8 w-8 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground">No pets yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add your pets to start booking services.
          </p>
          <Button className="mt-5 rounded-full px-5" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add your first pet
          </Button>
        </div>
      )}
    </div>
  )
}
