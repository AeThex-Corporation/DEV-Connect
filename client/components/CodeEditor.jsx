import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Play } from 'lucide-react';

    const CodeEditor = () => {
      const [code, setCode] = useState('// Your Lua code here\nprint("Hello from the Sandbox!")');
      const [output, setOutput] = useState('');

      const handleRunCode = () => {
        // This is a mock execution. A real implementation would need a Lua interpreter
        // running in a web worker or on a server for security.
        try {
          if (code.includes('print')) {
            const printStatements = code.match(/print\(([^)]+)\)/g) || [];
            const capturedOutput = printStatements.map(stmt => {
              const content = stmt.substring(stmt.indexOf('(') + 1, stmt.lastIndexOf(')'));
              // Super basic evaluation for strings and numbers
              return content.replace(/['"]/g, '');
            }).join('\n');
            setOutput(capturedOutput);
          } else {
            setOutput('// No print statements found to display output.');
          }
        } catch (e) {
          setOutput(`Error: ${e.message}`);
        }
      };

      return (
        <div className="flex flex-col h-full bg-gray-900/50 rounded-lg overflow-hidden">
          <div className="flex-grow p-2">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-green-400 font-mono resize-none outline-none"
              spellCheck="false"
            />
          </div>
          <div className="p-2 border-t border-gray-700">
            <Button onClick={handleRunCode} className="bg-green-600 hover:bg-green-700">
              <Play className="mr-2 h-4 w-4" /> Run
            </Button>
          </div>
          <div className="h-32 bg-black/50 p-2 font-mono text-sm text-gray-300 overflow-y-auto">
            <pre>&gt; {output}</pre>
          </div>
        </div>
      );
    };

    export default CodeEditor;