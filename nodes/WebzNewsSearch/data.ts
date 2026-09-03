export const CATEGORY_OPTIONS = [
	{ name: 'Arts, Culture and Entertainment', value: 'Arts, Culture and Entertainment' },
	{ name: 'Crime, Law and Justice', value: 'Crime, Law and Justice' },
	{ name: 'Disaster and Accident', value: 'Disaster and Accident' },
	{ name: 'Economy, Business and Finance', value: 'Economy, Business and Finance' },
	{ name: 'Education', value: 'Education' },
	{ name: 'Environment', value: 'Environment' },
	{ name: 'Health', value: 'Health' },
	{ name: 'Human Interest', value: 'Human Interest' },
	{ name: 'Labor', value: 'Labor' },
	{ name: 'Lifestyle and Leisure', value: 'Lifestyle and Leisure' },
	{ name: 'Politics', value: 'Politics' },
	{ name: 'Religion and Belief', value: 'Religion and Belief' },
	{ name: 'Science and Technology', value: 'Science and Technology' },
	{ name: 'Social Issue', value: 'Social Issue' },
	{ name: 'Sport', value: 'Sport' },
	{ name: 'War, Conflict and Unrest', value: 'War, Conflict and Unrest' },
	{ name: 'Weather', value: 'Weather' },
] as const;

export const SENTIMENT_OPTIONS = [
	{ name: 'Positive', value: 'positive' },
	{ name: 'Negative', value: 'negative' },
	{ name: 'Neutral', value: 'neutral' },
] as const;

export const POLITICAL_BIAS_OPTIONS = [
	{ name: 'Left', value: 'left' },
	{ name: 'Center', value: 'center' },
	{ name: 'Right', value: 'right' },
] as const;

export const TRUST_CATEGORY_OPTIONS = [
	{ name: 'Trusted News', value: 'trusted_news' },
	{ name: 'Fake News', value: 'fake_news' },
	{ name: 'Satirical News', value: 'satirical_news' },
] as const;

export const SOURCE_TYPE_OPTIONS = [
	{ name: 'Local News', value: 'local_news' },
	{ name: 'Newsroom', value: 'newsroom' },
	{ name: 'Government News', value: 'gov_news' },
] as const;

export const SORT_BY_OPTIONS = [
	{ name: 'Best Score', value: 'best_score' },
	{ name: 'Similarity', value: 'similarity' },
	{ name: 'Date (Newest First)', value: 'date_desc' },
	{ name: 'Date (Oldest First)', value: 'date_asc' },
] as const;
