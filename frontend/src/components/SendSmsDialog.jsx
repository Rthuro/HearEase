import React, { useState } from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { custom_text } from "@/store/useUserStore";

export function SendSmsDialog({ recipientNumber, recipientName}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
        const response = await custom_text(recipientNumber, formData.message);
        setOpen(false); // Close dialog
        setFormData({message: "" }); 

      if (response.status === 200) {
        toast.success(`Text sent to ${recipientName}`);
        setOpen(false); 
        setFormData({ message: "" }); 
      } else {
        throw new Error("Failed to send text");
      }
    } catch (error) {
      toast.error("Error sending text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Phone size={16} />
          Contact {recipientName}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="text-red-600" size={20} />
            Compose Custom Text
          </DialogTitle>
          <DialogDescription>
            Sending to: <span className="font-medium text-zinc-900">{recipientNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Text</Label>
            <Textarea 
              id="message"
              placeholder="Write your message here..."
              className="min-h-[150px] resize-none"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 gap-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Text
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}