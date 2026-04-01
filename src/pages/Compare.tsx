import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import Chatbot from '../components/ChatbotPanel'; 

const articles = [
  {
    id: 'art1',
    title: 'National Territory',
    old: [
      'The national territory comprises the Philippine archipelago, with all the islands and waters embraced therein, and all other territories over which the Philippines has sovereignty or jurisdiction, consisting of its terrestrial, fluvial, and aerial domains, including its territorial sea, the seabed, the subsoil, the insular shelves, and other submarine areas.',
      'The waters around, between, and connecting the islands of the archipelago, regardless of their breadth and dimensions, form part of the internal waters of the Philippines.',
    ],
    new: [
      'The national territory of the Federal Republic comprises the Philippine archipelago and all territories over which the Federal Republic exercises sovereignty or jurisdiction. It includes the terrestrial, fluvial, and aerial domains, the territorial sea, the exclusive economic zone, the seabed, the subsoil, the insular shelves, and all other submarine areas.',
      'The delineation of territorial boundaries of the federated regions shall be defined by federal law, in consultation with the concerned regional governments and the indigenous peoples within their ancestral domains.',
    ],
  },
  {
    id: 'art2',
    title: 'Declaration of Principles and State Policies',
    old: [
      'The Philippines is a democratic and republican State. Sovereignty resides in the people and all government authority emanates from them.',
      'The Philippines renounces war as an instrument of national policy, adopts the generally accepted principles of international law as part of the law of the land and adheres to the policy of peace, equality, justice, freedom, cooperation, and amity with all nations.',
      'Civilian authority is, at all times, supreme over the military. The Armed Forces of the Philippines is the protector of the people and the State. Its goal is to secure the sovereignty of the State and the integrity of the national territory.',
    ],
    new: [
      'The Federal Republic of the Philippines is a democratic, republican, and federal State. Sovereignty resides in the people and all government authority emanates from them. Governmental powers shall be distributed between the federal government and the regional governments.',
      'The Federal Republic renounces war as an instrument of national policy and adopts the generally accepted principles of international law as part of the law of the land.',
      'Civilian authority is, at all times, supreme over the military. The Federal Armed Forces shall protect the sovereignty of the State and the integrity of the national territory. Regional security forces may be established by law to maintain peace and order within federated regions.',
    ],
  },
  {
    id: 'art3',
    title: 'Bill of Rights',
    old: [
      'No person shall be deprived of life, liberty, or property without due process of law, nor shall any person be denied the equal protection of the laws.',
      'The right of the people to be secure in their persons, houses, papers, and effects against unreasonable searches and seizures of whatever nature and for any purpose shall be inviolable, and no search warrant or warrant of arrest shall issue except upon probable cause to be determined personally by the judge.',
      'The privacy of communication and correspondence shall be inviolable except upon lawful order of the court, or when public safety or order requires otherwise as prescribed by law.',
    ],
    new: [
      'The fundamental rights of every citizen shall be protected and guaranteed by both the federal and regional governments. No person shall be deprived of life, liberty, or property without due process of law.',
      'The right of the people to be secure in their persons, houses, papers, effects, and digital communications against unreasonable searches and seizures shall be inviolable. Digital privacy shall be a constitutionally protected right.',
      'The privacy of communication, correspondence, and personal data shall be inviolable except upon lawful order of the court. The right to data privacy and informational self-determination is hereby recognized and protected.',
    ],
  },
  {
    id: 'art4',
    title: 'Citizenship',
    old: [
      'The following are citizens of the Philippines: (1) Those who are citizens of the Philippines at the time of the adoption of this Constitution; (2) Those whose fathers or mothers are citizens of the Philippines; (3) Those born before January 17, 1973, of Filipino mothers, who elect Philippine citizenship upon reaching the age of majority; and (4) Those who are naturalized in accordance with law.',
      'Natural-born citizens are those who are citizens of the Philippines from birth without having to perform any act to acquire or perfect their Philippine citizenship.',
      'Philippine citizenship may be lost or reacquired in the manner provided by law.',
    ],
    new: [
      'Citizens of the Federal Republic include: (1) Those who are citizens at the time of the adoption of this Constitution; (2) Those whose fathers or mothers are citizens of the Federal Republic; (3) Those born in the territory of the Federal Republic to at least one parent who is a permanent resident; and (4) Those who are naturalized in accordance with federal law.',
      'Natural-born citizens are those who are citizens of the Federal Republic from birth without having to perform any act to acquire or perfect their citizenship. Dual citizenship shall be permitted as provided by federal law.',
      'Citizens of the Federal Republic shall also hold regional citizenship in the federated region of their domicile. Regional citizenship confers the right to vote in regional elections and to hold regional office.',
    ],
  },
  {
    id: 'art5',
    title: 'Suffrage',
    old: [
      'Suffrage may be exercised by all citizens of the Philippines not otherwise disqualified by law, who are at least eighteen years of age, and who shall have resided in the Philippines for at least one year and in the place wherein they propose to vote for at least six months immediately preceding the election.',
      'No literacy, property, or other substantive requirement shall be imposed on the exercise of suffrage.',
      'The Commission on Elections shall enforce and administer all laws and regulations relative to the conduct of an election, plebiscite, initiative, referendum, and recall.',
    ],
    new: [
      'The right to vote is guaranteed to all citizens of the Federal Republic who are at least eighteen years of age and are not otherwise disqualified by law. Residency requirements for voting in federal, regional, and local elections shall be defined by the Federal Electoral Code.',
      'No literacy, property, income, or other substantive requirement shall be imposed on the exercise of suffrage. The Federal Republic shall take affirmative steps to ensure accessible voting for persons with disabilities, overseas citizens, and indigenous peoples.',
      'The Federal Electoral Commission shall be an independent constitutional body with exclusive authority over the conduct of federal elections and plebiscites. Regional electoral bodies shall administer regional and local elections in accordance with federal standards.',
    ],
  },
];

export default function Compare() {
  const [activeTab, setActiveTab] = useState(articles[0].id);
  const { user } = useAuth();

  const loginOrVoteLink = user ? '/vote' : '/auth/login';
  const loginOrVoteLabel = user ? 'Go to Ballot →' : 'Login to Vote →';

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-navy-700 flex items-center justify-between px-6 shrink-0 bg-navy-900/90 backdrop-blur z-20">
        <Link to="/" className="flex items-center gap-2 text-parchment-muted hover:text-gold transition-colors font-mono text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <Link to={loginOrVoteLink} className="text-gold hover:text-gold-light transition-colors font-mono text-xs uppercase tracking-widest">
          {loginOrVoteLabel}
        </Link>
      </nav>

      {/* Tab Strip */}
      <div className="flex overflow-x-auto border-b border-navy-700 shrink-0 bg-navy-800 scrollbar-hide">
        {articles.map((art, i) => (
          <button
            key={art.id}
            onClick={() => setActiveTab(art.id)}
            className={`px-6 py-3 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${
              activeTab === art.id
                ? 'border-gold text-gold bg-gold/5'
                : 'border-transparent text-parchment-muted hover:text-parchment hover:bg-navy-700/30'
            }`}
          >
            Art. {i + 1}
          </button>
        ))}
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 border-b border-navy-700 shrink-0 bg-navy-900 z-10">
        <div className="p-4 text-center border-r border-navy-700">
          <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-slate-muted block mb-1">Current</span>
          <h2 className="font-display text-xl">1987 Constitution</h2>
        </div>
        <div className="p-4 text-center bg-gold/5">
          <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold block mb-1">Proposed</span>
          <h2 className="font-display text-xl text-gold-light">New Federal Constitution</h2>
        </div>
      </div>

      {/* Content Columns */}
      <div className="flex-1 grid grid-cols-2 overflow-hidden relative">
        <div className="overflow-y-auto p-8 lg:p-12 pb-32">
          {articles.map((art, i) => (
            <div key={`old-${art.id}`} className={activeTab === art.id ? 'block' : 'hidden'}>
              <span className="font-mono text-sm italic text-slate-muted block mb-2">Article {i + 1}</span>
              <h3 className="font-display text-2xl mb-6 text-parchment/80">{art.title}</h3>
              <div className="space-y-4">
                {art.old.map((section, j) => (
                  <p key={j} className="text-parchment-muted leading-relaxed">
                    <span className="font-mono text-xs text-slate-muted mr-1">§{j + 1}.</span> {section}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-px bg-navy-700 absolute left-1/2 top-0 bottom-0" />

        <div className="overflow-y-auto p-8 lg:p-12 pb-32 bg-gold/5">
          {articles.map((art, i) => (
            <div key={`new-${art.id}`} className={activeTab === art.id ? 'block' : 'hidden'}>
              <span className="font-mono text-sm italic text-gold block mb-2">Article {i + 1}</span>
              <h3 className="font-display text-2xl mb-6 text-gold-light">{art.title}</h3>
              <div className="space-y-4">
                {art.new.map((section, j) => (
                  <p key={j} className="text-parchment-muted leading-relaxed">
                    <span className="font-mono text-xs text-gold mr-1">§{j + 1}.</span> {section}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-navy-900/95 border-t border-navy-700 backdrop-blur flex items-center justify-between z-20">
        <span className="font-serif italic text-parchment-muted ml-4">Finished reading? Cast your official vote.</span>
        <Button asChild>
          <Link to={user ? '/vote' : '/auth/login'}>Go to Ballot →</Link>
        </Button>
      </div>
      <Chatbot articles={articles} />
    </div>
  );
}
