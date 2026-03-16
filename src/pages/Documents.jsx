import { FileStack } from 'lucide-react';

export default function Documents() {
  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-semibold mb-2">Documents</h2>
      <p className="text-muted-foreground text-sm mb-6">Your project documents and generated blueprints</p>
      <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-dashed border-border text-center px-4">
        <FileStack size={32} className="text-muted-foreground mb-3" />
        <h3 className="font-serif text-lg font-medium mb-1">Documents coming soon</h3>
        <p className="text-muted-foreground text-sm">Generated investor documents and project blueprints will appear here.</p>
      </div>
    </div>
  );
}