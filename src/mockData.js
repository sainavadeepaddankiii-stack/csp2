export const initialTrendingScams = [
  {
    id: "trend-1",
    title: "AI Voice Clone Kidnapping Scam",
    category: "AI Voice Clone",
    description: "Scammers clone a child's voice using a 3-second social media audio clip, calling parents demanding urgent ransom for a fake kidnapping.",
    threatLevel: "Critical",
    growthRate: "+142% this week",
    indicators: ["Calls from unknown/private numbers", "Extreme urgency & high ransom requests", "Refusal to let you speak directly to the child"]
  },
  {
    id: "trend-2",
    title: "Instagram 'Sponsored' Gift Card Giveaway",
    category: "Social Media Impersonation",
    description: "Fake sponsored posts impersonating popular retail brands. They direct users to lookalike pages to pay a small shipping fee ($1) to capture credit card details.",
    threatLevel: "High",
    growthRate: "+88% this week",
    indicators: ["Lookalike URLs (e.g., Target-giveaway-2026.com)", "Requiring credit card for 'free' gifts", "Urgent countdown timers"]
  },
  {
    id: "trend-3",
    title: "WhatsApp 'Hi Mum/Dad' Emergency",
    category: "Impersonation",
    description: "Scammers text parents from an unknown number pretending to be their child who broke their phone, urgently requesting a bank transfer to buy a new one.",
    threatLevel: "High",
    growthRate: "+65% this week",
    indicators: ["Claiming they changed their number", "Immediate request for electronic cash/bank transfer", "Refusing voice calls due to 'broken microphone'"]
  },
  {
    id: "trend-4",
    title: "Telegram Crypto 'Airdrop' Integration",
    category: "Crypto Fraud",
    description: "Malicious bots offering double-return token 'airdrops' if you connect your Web3 wallet. Once connected, they invoke a smart contract to drain all assets.",
    threatLevel: "Critical",
    growthRate: "+120% this week",
    indicators: ["Unsolicited invitations to group channels", "Promises of free double-returns", "Requests to sign unverified smart contract permissions"]
  },
  {
    id: "trend-5",
    title: "Fake USPS Address Update Request",
    category: "Phishing",
    description: "SMS stating a package cannot be delivered due to an incomplete address. Asks to click a link to update details, leading to a credit card skimming page.",
    threatLevel: "Medium",
    growthRate: "+35% this week",
    indicators: ["SMS from non-standard numbers or email handles", "Links using shorteners or spoofed domains", "Small payment required to update delivery"]
  }
];

export const initialRecentReports = [
  {
    id: "report-1",
    title: "Fake Elon Musk Crypto Doubler Airdrop",
    platform: "X",
    scammerHandle: "@elonmusk_promo_hub",
    scamType: "Crypto Fraud",
    description: "A promoted tweet leading to a fake medium article and a website asking users to send 0.1 to 5 BTC to get double back immediately.",
    threatLevel: "Critical",
    reportedAt: "10 mins ago",
    verifiedVotes: 124,
    status: "verified",
    financialLoss: 250000
  },
  {
    id: "report-2",
    title: "Zara Brand Ambassador Scam",
    platform: "Instagram",
    scammerHandle: "@zara_collab_scout_26",
    scamType: "Impersonation",
    description: "Scammer messaged offering free clothing and $500/post. Requests a $15 shipping fee for the package and personal identity documents.",
    threatLevel: "High",
    reportedAt: "45 mins ago",
    verifiedVotes: 86,
    status: "verified",
    financialLoss: 1250
  },
  {
    id: "report-3",
    title: "Family Emergency Cash Request",
    platform: "WhatsApp",
    scammerHandle: "+1 (415) 890-3419",
    scamType: "Impersonation",
    description: "Received text from 'daughter' claiming she lost her phone and needs $850 for rent immediately via Zelle. Luckily checked via normal call first.",
    threatLevel: "High",
    reportedAt: "2 hours ago",
    verifiedVotes: 93,
    status: "verified",
    financialLoss: 0
  },
  {
    id: "report-4",
    title: "Telegram Forex Trading Bot Scam",
    platform: "Telegram",
    scammerHandle: "@fx_algo_signal_signals",
    scamType: "Crypto Fraud",
    description: "Bot promised 300% profit per day. Admin demanded a $200 initial deposit and is now blocking withdrawal without a $100 'release fee'.",
    threatLevel: "Critical",
    reportedAt: "4 hours ago",
    verifiedVotes: 147,
    status: "verified",
    financialLoss: 25000
  },
  {
    id: "report-5",
    title: "Facebook Marketplace Lookalike Payment Scam",
    platform: "Facebook",
    scammerHandle: "Johnathan Miller (FB Profile)",
    scamType: "Phishing",
    description: "Buyer sent a fake Zelle payment screenshot saying money is pending until seller sends package tracking number. Zelle doesn't hold payments this way.",
    threatLevel: "Medium",
    reportedAt: "6 hours ago",
    verifiedVotes: 32,
    status: "verified",
    financialLoss: 12000
  },
  {
    id: "report-6",
    title: "Remote Data Entry Job Scam",
    platform: "WhatsApp",
    scammerHandle: "+44 7911 123456",
    scamType: "Job Scam",
    description: "Offer to work 1-2 hours a day for $200. Requires signing up on a web portal and depositing money to 'unlock tasks'.",
    threatLevel: "High",
    reportedAt: "1 day ago",
    verifiedVotes: 51,
    status: "verified",
    financialLoss: 45000
  }
];

export const platformColors = {
  Instagram: "#e1306c",
  WhatsApp: "#25d366",
  Telegram: "#0088cc",
  X: "#1da1f2",
  Facebook: "#1877f2",
  TikTok: "#ff0050",
  Other: "#6b7280"
};
