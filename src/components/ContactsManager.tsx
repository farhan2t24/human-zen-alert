import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  email: string;
}

export const ContactsManager = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "" });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const saved = localStorage.getItem("humanizedVision.contacts");
    if (saved) {
      setContacts(JSON.parse(saved));
    }
  };

  const saveContacts = (updatedContacts: Contact[]) => {
    localStorage.setItem("humanizedVision.contacts", JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      toast.error("Please fill in both name and email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
    };

    const updated = [...contacts, contact];
    saveContacts(updated);
    setNewContact({ name: "", email: "" });
    toast.success("Contact added successfully");
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    saveContacts(updated);
    toast.success("Contact removed");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Users className="w-5 h-5" />
          Manage Emergency Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emergency Contacts</DialogTitle>
          <DialogDescription>
            Add contacts to be notified during SOS alerts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Add new contact */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Contact
            </h4>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
            </div>
            <Button onClick={addContact} className="w-full">
              Add Contact
            </Button>
          </div>

          {/* Contacts list */}
          <div className="space-y-2">
            <h4 className="font-medium">Saved Contacts ({contacts.length})</h4>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No contacts added yet
              </p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteContact(contact.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
