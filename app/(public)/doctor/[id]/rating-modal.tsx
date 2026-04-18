'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import type { RatingPayload } from '@/lib/types/booking';

type RatingModalProps = {
  appointmentId?: string;
  doctorName: string;
  onSuccessAction?: () => void;
};

export default function RatingModal({ appointmentId, doctorName, onSuccessAction }: RatingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const ratingMutation = useMutation({
    mutationFn: async (payload: RatingPayload) => {
      const response = await fetch(`/api/appointments/${appointmentId}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'فشل حفظ التقييم');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsOpen(false);
      setRating(0);
      setComment('');
      onSuccessAction?.();
    },
  });

  const handleSubmit = () => {
    if (rating === 0 || !appointmentId) {
      return;
    }

    ratingMutation.mutate({
      rating,
      comment: comment.trim() || undefined,
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => appointmentId && setIsOpen(true)}
        disabled={!appointmentId}
        data-testid="open-rating-modal"
        title={appointmentId ? 'تقييم الطبيب' : 'لا يوجد موعد مكتمل للتقييم'}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Star className="w-4 h-4" />
        <span>{appointmentId ? 'قيّم الطبيب' : 'نجمة'}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm text-right">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">قيّم د. {doctorName}</h3>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">كيف كانت تجربتك مع الطبيب؟</p>
          <div className="flex gap-2 justify-end">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                data-testid={`rating-star-${star}`}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">تعليق (اختياري)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شارك تجربتك..."
            maxLength={500}
            rows={3}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setRating(0);
              setComment('');
            }}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0 || ratingMutation.isPending}
            data-testid="submit-rating"
            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:bg-gray-300 transition-colors"
          >
            {ratingMutation.isPending ? 'جاري...' : 'حفظ التقييم'}
          </button>
        </div>

        {ratingMutation.isError && (
          <p className="text-xs text-red-600 mt-3">
            {(ratingMutation.error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}




