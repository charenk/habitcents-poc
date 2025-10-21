'use client';

import { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  DollarSign, 
  Calendar,
  Building2
} from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  onSwipe: (direction: 'left' | 'right' | 'up', transactionId: string) => void;
  onCategoryChange: (transactionId: string, category: string) => void;
  isTop: boolean;
}

const categories = [
  'Food & Dining',
  'Transportation', 
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Subscriptions',
  'Other'
];

export default function TransactionCard({ 
  transaction, 
  onSwipe, 
  onCategoryChange,
  isTop 
}: TransactionCardProps) {
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform values for visual feedback
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-200, 200], [0.8, 0.8]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Determine swipe direction based on offset and velocity
    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset > 0 || velocity > 0) {
        // Swipe right - confirm category
        onSwipe('right', transaction.id);
      } else {
        // Swipe left - skip
        onSwipe('left', transaction.id);
      }
    } else if (info.offset.y < -threshold || info.velocity.y < -500) {
      // Swipe up - edit category
      onSwipe('up', transaction.id);
      setShowCategorySelector(true);
    } else {
      // Return to center
      x.set(0);
      y.set(0);
    }
  };

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    return {
      formatted: `$${absAmount.toFixed(2)}`,
      isNegative,
      color: isNegative ? 'text-red-600' : 'text-green-600'
    };
  };

  const amount = formatAmount(transaction.amount);

  return (
    <>
      <motion.div
        className="absolute inset-0"
        style={{ x, y, rotate, opacity, scale }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
        animate={isTop ? { scale: 1, zIndex: 10 } : { scale: 0.95, zIndex: 5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Card className="w-full h-64 shadow-lg">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-light-blue rounded-full">
                  <Building2 className="h-5 w-5 text-navy" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy truncate max-w-32">
                    {transaction.merchant}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate max-w-32">
                    {transaction.description}
                  </p>
                </div>
              </div>
              <Badge 
                variant={transaction.confidence_score > 0.8 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {Math.round(transaction.confidence_score * 100)}%
              </Badge>
            </div>

            {/* Amount */}
            <div className="text-center mb-4">
              <div className={`text-3xl font-bold ${amount.color}`}>
                {amount.formatted}
              </div>
              <div className="text-sm text-muted-foreground">
                {amount.isNegative ? 'Expense' : 'Income'}
              </div>
            </div>

            {/* Category */}
            <div className="text-center mb-4">
              <Badge variant="outline" className="text-sm">
                {transaction.category}
              </Badge>
            </div>

            {/* Date */}
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(transaction.date).toLocaleDateString()}</span>
            </div>

            {/* Swipe indicators */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Left swipe indicator */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0"
                   style={{ opacity: useTransform(x, [-200, -100], [1, 0]) }}>
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-6 w-6" />
                  <span className="font-medium">Skip</span>
                </div>
              </div>

              {/* Right swipe indicator */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0"
                   style={{ opacity: useTransform(x, [100, 200], [0, 1]) }}>
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-medium">Confirm</span>
                </div>
              </div>

              {/* Up swipe indicator */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0"
                   style={{ opacity: useTransform(y, [-100, -50], [0, 1]) }}>
                <div className="flex items-center space-x-2 text-blue-600">
                  <Edit3 className="h-6 w-6" />
                  <span className="font-medium">Edit</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Select Category
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={transaction.category === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      onCategoryChange(transaction.id, category);
                      setShowCategorySelector(false);
                    }}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCategorySelector(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
