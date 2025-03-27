
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FigmaAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (token: string) => void;
}

const FigmaAuth: React.FC<FigmaAuthProps> = ({ isOpen, onClose, onAuth }) => {
  const [token, setToken] = useState("");
  
  const handleAuth = () => {
    if (token.trim()) {
      onAuth(token.trim());
      onClose();
    }
  };
  
  // Note: In a production app, you would implement OAuth2 flow
  // This is a simplified version for demonstration purposes
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Figma</DialogTitle>
          <DialogDescription>
            To use FigJam boards, you need to connect your Figma account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <p className="text-sm text-gray-500">
            Please enter your Figma personal access token. You can create one in your Figma account settings.
          </p>
          
          <input
            type="password"
            placeholder="Paste your Figma access token"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          
          <p className="text-xs text-gray-500">
            For a production app, you would implement OAuth2 for a secure login flow. This is a simplified version.
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAuth} disabled={!token.trim()}>Connect</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FigmaAuth;
