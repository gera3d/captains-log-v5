import VentureBentoCockpit from './VentureBentoCockpit';

export default function VentureScorecard({ scorecard, marketPosition }) {
  if (!scorecard) return null;
  return <VentureBentoCockpit summary={{ scorecard, marketPosition }} />;
}
