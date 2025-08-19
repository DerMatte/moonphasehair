import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


import InfoPicture from '@/public/Moon-Hair.png';
import Image from 'next/image';
import { InfoBox } from "@nsmr/pixelart-react";

export function InfoButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
      <Button variant="ghost" className="p-0 m-0 flex-none gap-0">
          <InfoBox size={32} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Moon Phase Hair Guide</DialogTitle>
          <DialogDescription>
             How the moon phase affects your hair growth and styling.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Image src={InfoPicture} alt="Moon Hair" className="w-full h-auto" />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
