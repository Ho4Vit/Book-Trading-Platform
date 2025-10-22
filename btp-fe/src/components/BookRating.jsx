import React from "react";
import { feedbackApi } from "@/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import { Star } from "lucide-react";

/**
 * BookRating Component
 * Displays the average rating for a book on the bottom right corner of book images
 *
 * @param {Object} props - Component props
 * @param {number|string} props.bookId - The ID of the book to display rating for
 * @param {string} props.className - Optional additional CSS classes
 * @returns {JSX.Element|null} Rating badge or null if no rating exists
 */
const BookRating = ({ bookId, className = "" }) => {
	const { data: ratingData } = useCustomQuery(
		["bookRating", bookId],
		() => feedbackApi.getAverageRating(bookId),
		{
			staleTime: 1000 * 60 * 5,
			enabled: !!bookId,
		}
	);

	const averageRating = ratingData?.data?.averageRating || ratingData || 0;

	// Don't render if there's no rating
	if (!averageRating || averageRating === 0) return null;

	return (
		<div
			className={`absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 ${className}`}
			title={`Đánh giá trung bình: ${Number(averageRating).toFixed(1)}/5`}
		>
			<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
			<span className="text-white font-semibold text-sm">
				{Number(averageRating).toFixed(1)}
			</span>
		</div>
	);
};

export default BookRating;

