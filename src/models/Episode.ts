import mongoose from 'mongoose';

const EpisodeSchema = new mongoose.Schema({
  id: { type: String, required: true }, // UUID
  videoUrl: String,
  title: String,
  description: String,
  audioUrl: String,
  pubDate: Date,
});

export default mongoose.model('Episode', EpisodeSchema);
