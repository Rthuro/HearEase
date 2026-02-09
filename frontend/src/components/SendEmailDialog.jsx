import React, { useState } from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { custom_email } from "@/store/useUserStore";

export function SendEmailDialog({ recipientEmail, recipientName, defaultSubject = "" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: defaultSubject,
    message: "",
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
        const response = await custom_email(recipientEmail, formData.subject, formData.message);
        setOpen(false); // Close dialog
        setFormData({ subject: defaultSubject, message: "" }); 

      if (response.status === 200) {
        toast.success(`Email sent to ${recipientName}`);
        setOpen(false); 
        setFormData({ subject: defaultSubject, message: "" }); 
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      toast.error("Error sending email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mail size={16} />
          Email {recipientName}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="text-red-600" size={20} />
            Compose Custom Email
          </DialogTitle>
          <DialogDescription>
            Sending to: <span className="font-medium text-zinc-900">{recipientEmail}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject"
              placeholder="e.g., Update on your mediation case" 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
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
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}