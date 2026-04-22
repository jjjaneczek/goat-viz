import { useMemo, useState } from "react";

export const ALL_TAGS = [
	"Consistency",
	"Peak Dominance",
	"Titles & Trophies",
	"Longevity",
	"Rivalry",
	"Beating the Odds",
	"Records",
	"Era Difficulty",
	"Mental Strength",
	"Innovation",
	"Impact on the Sport",
	"Clutch Performance",
];

export const TAG_COLORS = {
	Consistency: "#60A5FA",
	"Peak Dominance": "#F59E0B",
	"Titles & Trophies": "#8B5CF6",
	Longevity: "#14B8A6",
	Rivalry: "#F97316",
	"Beating the Odds": "#EF4444",
	Records: "#22C55E",
	"Era Difficulty": "#E11D48",
	"Mental Strength": "#A855F7",
	Innovation: "#06B6D4",
	"Impact on the Sport": "#F472B6",
	"Clutch Performance": "#FACC15",
};

function toPct(intensity) {
	return Math.round((intensity ?? 1) * 100);
}

function lmhLabel(intensity) {
	const v = intensity ?? 1;
	if (v < 0.75) return "L";
	if (v < 1.25) return "M";
	return "H";
}

export default function KeywordSidePanel({
	selectedTags,
	setSelectedTags,
	tagIntensities,
	setTagIntensities,
}) {
	const [open, setOpen] = useState(true);

	const availableTags = useMemo(
		() => ALL_TAGS.filter((t) => !selectedTags.includes(t)),
		[selectedTags],
	);

	function removeTag(tag) {
		setSelectedTags(selectedTags.filter((t) => t !== tag));
		setTagIntensities((prev) => {
			const next = { ...prev };
			delete next[tag];
			return next;
		});
	}

	function addTag(tag) {
		if (!tag) return;
		if (selectedTags.includes(tag)) return;
		setSelectedTags([...selectedTags, tag]);
		setTagIntensities((prev) => ({ ...prev, [tag]: prev?.[tag] ?? 1 }));
	}

	return (
		<div
			style={{
				position: "fixed",
				left: 16,
				top: 96,
				width: open ? 290 : 44,
				height: "calc(100vh - 120px)",
				backgroundColor: "#0f0f0f",
				border: "1px solid #2a2a2a",
				borderRadius: 16,
				boxShadow: "0 0 28px rgba(0,0,0,0.35)",
				overflow: "hidden",
				zIndex: 30,
				transition: "width 200ms ease",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: open ? "space-between" : "center",
					padding: "10px 12px",
					borderBottom: "1px solid #1f1f1f",
					backgroundColor: "#111",
				}}
			>
				{open && (
					<span style={{ color: "#e5e5e5", fontSize: 12, fontWeight: 800 }}>
						Keywords
					</span>
				)}
				<button
					onClick={() => setOpen((v) => !v)}
					style={{
						background: "none",
						border: "1px solid #2a2a2a",
						borderRadius: 10,
						color: "#9ca3af",
						padding: "6px 10px",
						cursor: "pointer",
						fontSize: 12,
						fontWeight: 800,
					}}
					title={open ? "Collapse" : "Expand"}
				>
					{open ? "⟨" : "⟩"}
				</button>
			</div>

			{open && (
				<div style={{ padding: 12, overflowY: "auto", height: "100%" }}>
					<p style={{ color: "#6b7280", fontSize: 11, margin: "0 0 10px" }}>
						Tune each keyword (L / M / H) to recompute rankings.
					</p>

					<div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
						<select
							defaultValue=""
							onChange={(e) => {
								addTag(e.target.value);
								e.currentTarget.value = "";
							}}
							style={{
								flex: 1,
								backgroundColor: "#111827",
								border: "1px solid #2a2a2a",
								borderRadius: 10,
								color: "#e5e5e5",
								padding: "8px 10px",
								fontSize: 12,
							}}
						>
							<option value="" disabled>
								+ Add keyword…
							</option>
							{availableTags.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</div>

					{selectedTags.length === 0 ? (
						<p style={{ color: "#6b7280", fontSize: 12 }}>
							No keywords selected.
						</p>
					) : (
						selectedTags.map((tag) => {
							const intensity = tagIntensities?.[tag] ?? 1;
							const col = TAG_COLORS[tag] || "#F59E0B";
							const pct = toPct(intensity);
							return (
								<div
									key={tag}
									style={{
										padding: 10,
										borderRadius: 12,
										border: "1px solid #1f1f1f",
										backgroundColor: "#111",
										marginBottom: 10,
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											gap: 10,
											marginBottom: 8,
										}}
									>
										<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
											<div
												style={{
													width: 8,
													height: 8,
													borderRadius: "50%",
													backgroundColor: col,
												}}
											/>
											<span
												style={{
													color: "#e5e5e5",
													fontSize: 12,
													fontWeight: 800,
												}}
											>
												{tag}
											</span>
										</div>
										<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
											<span
												style={{
													color: col,
													fontSize: 12,
													fontWeight: 900,
													padding: "2px 8px",
													borderRadius: 999,
													border: `1px solid ${col}55`,
													backgroundColor: `${col}22`,
												}}
												title={`Internal level: ${pct}%`}
											>
												{lmhLabel(intensity)}
											</span>
											<button
												onClick={() => removeTag(tag)}
												style={{
													background: "none",
													border: "1px solid #2a2a2a",
													borderRadius: 10,
													color: "#6b7280",
													padding: "4px 8px",
													cursor: "pointer",
													fontSize: 11,
													fontWeight: 800,
												}}
												title="Remove keyword"
											>
												Remove
											</button>
										</div>
									</div>
									<input
										type="range"
										min="0"
										max="150"
										step="1"
										value={pct}
										onChange={(e) => {
											const next = parseInt(e.target.value, 10) / 100;
											setTagIntensities((prev) => ({ ...prev, [tag]: next }));
										}}
										style={{ width: "100%", accentColor: col, cursor: "pointer" }}
									/>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											marginTop: 6,
											fontSize: 10,
											color: "#6b7280",
										}}
									>
										<span>L</span>
										<span>M</span>
										<span>H</span>
									</div>
								</div>
							);
						})
					)}
				</div>
			)}
		</div>
	);
}

