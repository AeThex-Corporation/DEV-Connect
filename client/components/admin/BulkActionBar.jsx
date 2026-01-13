import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';

export const BulkActionBar = ({ selectedCount, onClear, onApprove, onReject, onDelete, entityName = 'items' }) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-gray-900 border border-gray-700 shadow-2xl px-6 py-3 rounded-full"
        >
          <span className="text-sm font-medium text-white whitespace-nowrap">
            <span className="bg-white text-black px-2 py-0.5 rounded-full text-xs font-bold mr-2">
              {selectedCount}
            </span>
            {entityName} selected
          </span>

          <div className="h-6 w-px bg-gray-700 mx-2" />

          <div className="flex items-center gap-2">
            {onApprove && (
              <Button size="sm" onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-white h-8 rounded-full px-4">
                <CheckCircle className="w-3 h-3 mr-2" /> Approve
              </Button>
            )}
            
            {onReject && (
              <Button size="sm" variant="destructive" onClick={onReject} className="h-8 rounded-full px-4">
                <ShieldAlert className="w-3 h-3 mr-2" /> Reject
              </Button>
            )}

            {onDelete && (
              <Button size="sm" variant="destructive" onClick={onDelete} className="h-8 rounded-full px-4">
                <Trash2 className="w-3 h-3 mr-2" /> Delete
              </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={onClear} className="ml-2 h-8 w-8 rounded-full hover:bg-gray-800">
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};