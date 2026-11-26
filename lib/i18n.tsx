"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * App-wide Telugu / English language layer.
 *
 * Telugu is the default (the platform serves a Telugu-speaking constituency);
 * every surface carries an English toggle. Data values coming back from the
 * API (categories, urgency, status, trend) stay English in the database and
 * are translated only for display through the label helpers below.
 */

export type Lang = "te" | "en";

type Entry = { en: string; te: string };
type Dict = Record<string, Entry>;

export const STRINGS: Dict = {
  "app.name": { en: "People's Priorities", te: "ప్రజల ప్రాథమ్యతలు" },

  "nav.citizen": { en: "Citizen Chat", te: "పౌరుల చాట్" },
  "nav.staff": { en: "Staff Console", te: "సిబ్బంది కన్సోల్" },
  "nav.mpChat": { en: "MP Chat", te: "ఎంపీ చాట్" },
  "nav.mpDash": { en: "MP Dashboard", te: "ఎంపీ డ్యాష్‌బోర్డ్" },
  "nav.public": { en: "Public Issues", te: "బహిరంగ సమస్యలు" },

  "home.heroDesc": {
    en: "A conversational constituency intelligence platform that turns scattered citizen complaints into ranked, evidence-backed development priorities, while guiding citizens to relevant schemes, services and complaint channels.",
    te: "చెదురుమదురుగా ఉన్న పౌరుల ఫిర్యాదులను రాంక్ చేసిన, ఆధారాలతో కూడిన అభివృద్ధి ప్రాథమ్యతలుగా మార్చే సంభాషణాత్మక నియోజకవర్గ మేధస్సు వేదిక. పౌరులను సంబంధిత పథకాలు, సేవలు మరియు ఫిర్యాదు మార్గాలకు కూడా మార్గనిర్దేశం చేస్తుంది.",
  },
  "home.heroSub": {
    en: "This platform does not replace official grievance systems. It acts as a listening, prioritization, guidance and planning layer.",
    te: "ఈ వేదిక అధికారిక ఫిర్యాదు వ్యవస్థలను భర్తీ చేయదు. ఇది శ్రవణ, ప్రాథమ్యీకరణ, మార్గనిర్దేశన మరియు ప్రణాళిక పొరగా పనిచేస్తుంది.",
  },
  "home.surf.citizen.desc": {
    en: "Report a local issue conversationally in your own language and get immediate guidance plus a tracking ID.",
    te: "మీ స్వంత భాషలో సంభాషణ ద్వారా స్థానిక సమస్యను నమోదు చేయండి; వెంటనే మార్గనిర్దేశం మరియు ట్రాకింగ్ ఐడి పొందండి.",
  },
  "home.surf.staff.desc": {
    en: "Enter offline complaints, review AI-extracted fields, manage clusters, update status and generate reports.",
    te: "ఆఫ్‌లైన్ ఫిర్యాదులను నమోదు చేయండి, AI సేకరించిన వివరాలను సమీక్షించండి, సమూహాలను నిర్వహించండి, స్థితిని నవీకరించండి, నివేదికలు తయారుచేయండి.",
  },
  "home.surf.mpChat.desc": {
    en: "Ask natural questions over the constituency knowledge base and get evidence-backed answers.",
    te: "నియోజకవర్గ జ్ఞాన భాండారంపై సహజ ప్రశ్నలు అడగండి; ఆధారాలతో కూడిన సమాధానాలు పొందండి.",
  },
  "home.surf.mpDash.desc": {
    en: "Visual overview: top priorities, hotspots, category breakdown, rising issues and reports.",
    te: "దృశ్య అవలోకనం: అగ్ర ప్రాథమ్యతలు, హాట్‌స్పాట్‌లు, వర్గ విభజన, పెరుగుతున్న సమస్యలు మరియు నివేదికలు.",
  },
  "home.surf.public.desc": {
    en: "Anonymized issue clusters and public status updates. No personal data.",
    te: "అనామక సమస్యల సమూహాలు మరియు బహిరంగ స్థితి అప్‌డేట్‌లు. వ్యక్తిగత సమాచారం లేదు.",
  },
  "home.open": { en: "Open →", te: "తెరవండి →" },

  "citizen.title": { en: "Report an Issue", te: "సమస్య నమోదు చేయండి" },
  "citizen.subtitle": {
    en: "Your issue will be recorded, grouped with similar local issues, and made visible to the MP office. We will also suggest next steps. This does not replace official grievance systems.",
    te: "మీ సమస్య నమోదు చేయబడి, ఇలాంటి స్థానిక సమస్యలతో సమూహపరచబడి, ఎంపీ కార్యాలయం దృష్టికి చేరుతుంది. తదుపరి చర్యలను కూడా సూచిస్తాం. ఇది అధికారిక ఫిర్యాదు వ్యవస్థలను భర్తీ చేయదు.",
  },
  "citizen.greeting": {
    en: "Namaste. Please describe your issue in your own language (English, Telugu or Hindi). For example: water, road, drainage, streetlight, pension, health or school problems.",
    te: "నమస్తే. దయచేసి మీ సమస్యను మీ స్వంత భాషలో (తెలుగు, ఇంగ్లీష్ లేదా హిందీ) వివరించండి. ఉదాహరణ: నీరు, రోడ్డు, మురుగునీరు, వీధిదీపం, పింఛను, ఆరోగ్యం లేదా పాఠశాల సమస్యలు.",
  },
  "citizen.placeholder": {
    en: "Describe your issue...",
    te: "మీ సమస్యను వివరించండి...",
  },
  "citizen.send": { en: "Send", te: "పంపండి" },
  "citizen.thinking": {
    en: "Agent is thinking...",
    te: "ఏజెంట్ ఆలోచిస్తోంది...",
  },
  "citizen.error": {
    en: "Sorry, something went wrong. Please try again.",
    te: "క్షమించండి, ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
  },
  "citizen.autoLang": { en: "Auto language", te: "స్వయంచాలక భాష" },
  "citizen.shareLoc": { en: "Share my location", te: "నా స్థానం పంపండి" },
  "citizen.orArea": {
    en: "or type area / landmark",
    te: "లేదా ప్రాంతం / గుర్తు రాయండి",
  },
  "citizen.sendLoc": { en: "Send location", te: "స్థానం పంపండి" },
  "citizen.trackingId": { en: "Tracking ID", te: "ట్రాకింగ్ ఐడి" },
  "citizen.addedToCluster": {
    en: "Added to existing cluster: {title}",
    te: "ఇప్పటికే ఉన్న సమూహంలో చేర్చబడింది: {title}",
  },
  "citizen.newCluster": {
    en: "Started a new cluster: {title}",
    te: "కొత్త సమూహం ప్రారంభించబడింది: {title}",
  },
  "citizen.sentForReview": {
    en: "Sent to MP office staff for review.",
    te: "సమీక్ష కోసం ఎంపీ కార్యాలయ సిబ్బందికి పంపబడింది.",
  },
  "citizen.nextSteps": {
    en: "What you can do next",
    te: "తర్వాత మీరు చేయగలిగినవి",
  },
  "citizen.officialLink": { en: "Official link →", te: "అధికారిక లింక్ →" },
  "citizen.tryExamples": {
    en: "Try these examples",
    te: "ఈ ఉదాహరణలు ప్రయత్నించండి",
  },
  "citizen.ex1": {
    en: "Water has not come in our colony for five days near the old school",
    te: "మా కాలనీలో పాత పాఠశాల దగ్గర ఐదు రోజులుగా నీరు రావడం లేదు",
  },
  "citizen.ex2": {
    en: "Drainage water is overflowing near the temple in Ward 8",
    te: "వార్డ్ 8లో ఆలయం దగ్గర మురుగునీరు పొంగి పొర్లుతోంది",
  },
  "citizen.ex3": {
    en: "My old age pension has not come for two months",
    te: "నా వృద్ధాప్య పింఛను రెండు నెలలుగా రావడం లేదు",
  },

  "staff.title": { en: "Staff Console", te: "సిబ్బంది కన్సోల్" },
  "staff.subtitle": {
    en: "Enter offline complaints, review AI-extracted fields, and manage issue clusters and reports.",
    te: "ఆఫ్‌లైన్ ఫిర్యాదులను నమోదు చేయండి, AI సేకరించిన వివరాలను సమీక్షించండి, సమస్యల సమూహాలు మరియు నివేదికలను నిర్వహించండి.",
  },
  "staff.tab.entry": { en: "Manual Entry", te: "మాన్యువల్ నమోదు" },
  "staff.tab.submissions": { en: "Submissions", te: "సమర్పణలు" },
  "staff.tab.review": { en: "Review Queue", te: "సమీక్ష క్యూన్" },
  "staff.tab.clusters": { en: "Clusters", te: "సమూహాలు" },
  "staff.entryTitle": {
    en: "New complaint from call / WhatsApp / meeting note",
    te: "కాల్ / వాట్సాప్ / మీటింగ్ నోట్ నుండి కొత్త ఫిర్యాదు",
  },
  "staff.entryPlaceholder": {
    en: 'e.g. "Caller from Ward 8 says drainage water has been overflowing near temple for 3 days."',
    te: 'ఉదా: "వార్డ్ 8 నుండి కాలర్ చెప్పారు: ఆలయం దగ్గర 3 రోజులుగా మురుగునీరు పొంగుతోంది."',
  },
  "staff.structure": { en: "Structure & Save", te: "విశ్లేషించి సేవ్ చేయండి" },
  "staff.structuring": { en: "Structuring...", te: "విశ్లేషిస్తోంది..." },
  "staff.aiResult": { en: "AI-extracted result", te: "AI సేకరించిన ఫలితం" },
  "staff.aiEmpty": {
    en: "The structured fields, tracking ID and suggested cluster will appear here.",
    te: "విశ్లేషిత వివరాలు, ట్రాకింగ్ ఐడి మరియు సూచించిన సమూహం ఇక్కడ కనిపిస్తాయి.",
  },
  "staff.f.trackingId": { en: "Tracking ID", te: "ట్రాకింగ్ ఐడి" },
  "staff.f.category": { en: "Category", te: "వర్గం" },
  "staff.f.secondary": { en: "Secondary", te: "ద్వితీయ వర్గం" },
  "staff.f.urgency": { en: "Urgency", te: "అత్యవసర స్థాయి" },
  "staff.f.summary": { en: "Summary", te: "సారాంశం" },
  "staff.f.cluster": { en: "Cluster", te: "సమూహం" },
  "staff.f.clusterAction": { en: "Cluster action", te: "సమూహ చర్య" },
  "staff.flagged": {
    en: "Flagged for review",
    te: "సమీక్ష కోసం గుర్తించబడింది",
  },
  "staff.loadingSubs": {
    en: "Loading submissions...",
    te: "సమర్పణలు లోడ్ అవుతున్నాయి...",
  },
  "staff.loadingReview": {
    en: "Loading review queue...",
    te: "సమీక్ష క్యూన్ లోడ్ అవుతోంది...",
  },
  "staff.loadingClusters": {
    en: "Loading clusters...",
    te: "సమూహాలు లోడ్ అవుతున్నాయి...",
  },
  "staff.th.tracking": { en: "Tracking", te: "ట్రాకింగ్" },
  "staff.th.summary": { en: "Summary", te: "సారాంశం" },
  "staff.th.category": { en: "Category", te: "వర్గం" },
  "staff.th.urgency": { en: "Urgency", te: "అత్యవసరం" },
  "staff.th.location": { en: "Location", te: "స్థానం" },
  "staff.th.status": { en: "Status", te: "స్థితి" },
  "staff.subsCount": { en: "{n} submissions", te: "{n} సమర్పణలు" },
  "staff.noReview": {
    en: "No submissions currently need review.",
    te: "ప్రస్తుతం సమీక్ష అవసరమైన సమర్పణలు లేవు.",
  },
  "staff.sensitive": { en: "Sensitive: {flags}", te: "సున్నితమైనది: {flags}" },
  "staff.approve": { en: "Approve", te: "ఆమోదించండి" },
  "staff.submissionsWord": { en: "submissions", te: "సమర్పణలు" },
  "staff.uniqueCitizens": { en: "unique citizens", te: "ప్రత్యేక పౌరులు" },
  "staff.noLocation": { en: "no location", te: "స్థానం లేదు" },
  "staff.statusWord": { en: "status", te: "స్థితి" },
  "staff.publish": { en: "Publish update", te: "అప్‌డేట్ ప్రచురించండి" },
  "staff.publishPrompt": {
    en: "Public update message (anonymized, no personal data):",
    te: "బహిరంగ అప్‌డేట్ సందేశం (అనామకంగా, వ్యక్తిగత సమాచారం లేకుండా):",
  },
  "staff.publishDefault": {
    en: "This issue has been forwarded to the relevant department for review.",
    te: "ఈ సమస్య సంబంధిత శాఖకు సమీక్ష కోసం పంపబడింది.",
  },
  "staff.published": {
    en: "Public update published.",
    te: "బహిరంగ అప్‌డేట్ ప్రచురించబడింది.",
  },
  "staff.catsTracked": {
    en: "Categories tracked: {cats}",
    te: "ట్రాక్ చేస్తున్న వర్గాలు: {cats}",
  },

  "mpchat.title": { en: "MP Chat Intelligence", te: "ఎంపీ చాట్ మేధస్సు" },
  "mpchat.subtitle": {
    en: "Evidence-backed answers over the constituency knowledge base.",
    te: "నియోజకవర్గ జ్ఞాన భాండారంపై ఆధారాలతో కూడిన సమాధానాలు.",
  },
  "mpchat.greeting": {
    en: "Ask me about constituency priorities, specific areas, trends, or request a report. I answer from recorded issue data and show my confidence and sources.",
    te: "నియోజకవర్గ ప్రాథమ్యతలు, నిర్దిష్ట ప్రాంతాలు, ధోరణుల గురించి అడగండి లేదా నివేదిక కోరండి. నమోదైన సమస్యల డేటా నుండి సమాధానమిస్తాను; నా విశ్వసనీయత మరియు ఆధారాలను చూపిస్తాను.",
  },
  "mpchat.placeholder": {
    en: "Ask about priorities, areas, trends, or reports...",
    te: "ప్రాథమ్యతలు, ప్రాంతాలు, ధోరణులు లేదా నివేదికల గురించి అడగండి...",
  },
  "mpchat.ask": { en: "Ask", te: "అడగండి" },
  "mpchat.thinking": { en: "Thinking...", te: "ఆలోచిస్తోంది..." },
  "mpchat.error": {
    en: "Something went wrong. Please try again.",
    te: "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
  },
  "mpchat.suggested": { en: "Suggested questions", te: "సూచించిన ప్రశ్నలు" },
  "mpchat.sug1": {
    en: "What are the top issues this week?",
    te: "ఈ వారం అగ్ర సమస్యలు ఏమిటి?",
  },
  "mpchat.sug2": {
    en: "Why is water shortage ranked first?",
    te: "నీటి కొరత ఎందుకు మొదటి స్థానంలో ఉంది?",
  },
  "mpchat.sug3": {
    en: "What is happening in Ward 8?",
    te: "వార్డ్ 8లో ఏం జరుగుతోంది?",
  },
  "mpchat.sug4": {
    en: "Show me the map of water issues",
    te: "నీటి సమస్యల మ్యాప్ చూపించండి",
  },
  "mpchat.sug5": {
    en: "Generate a report for tomorrow's review",
    te: "రేపటి సమీక్ష కోసం నివేదిక తయారుచేయండి",
  },
  "scene.submissions": { en: "submissions", te: "సమర్పణలు" },
  "scene.uniqueCitizens": { en: "unique citizens", te: "ప్రత్యేక పౌరులు" },
  "scene.photos": { en: "photos", te: "ఫోటోలు" },
  "scene.score": { en: "score {n}", te: "స్కోరు {n}" },
  "scene.mapReady": {
    en: "Map scene ready with {n} hotspot points. See the MP Dashboard for the full heatmap.",
    te: "{n} హాట్‌స్పాట్ పాయింట్లతో మ్యాప్ సిద్ధంగా ఉంది. పూర్తి హీట్‌మ్యాప్ కోసం ఎంపీ డ్యాష్‌బోర్డ్ చూడండి.",
  },

  "dash.title": { en: "MP Dashboard", te: "ఎంపీ డ్యాష్‌బోర్డ్" },
  "dash.subtitle": {
    en: "Constituency: Visakhapatnam · this week",
    te: "నియోజకవర్గం: విశాఖపట్నం · ఈ వారం",
  },
  "dash.genReport": {
    en: "Generate weekly report",
    te: "వారపు నివేదిక తయారుచేయండి",
  },
  "dash.generating": { en: "Generating...", te: "తయారవుతోంది..." },
  "dash.loading": { en: "Loading dashboard...", te: "డ్యాష్‌బోర్డ్ లోడ్ అవుతోంది..." },
  "dash.stat.total": { en: "Total submissions", te: "మొత్తం సమర్పణలు" },
  "dash.stat.clusters": { en: "Active clusters", te: "క్రియాశీల సమూహాలు" },
  "dash.stat.top": { en: "Top priority", te: "అగ్ర ప్రాథమ్యత" },
  "dash.stat.urgent": {
    en: "Urgent & unverified",
    te: "అత్యవసర & ధృవీకరించనివి",
  },
  "dash.top5": { en: "Top 5 priority issues", te: "టాప్ 5 ప్రాథమ్య సమస్యలు" },
  "dash.top5Sub": {
    en: "Ranked by explainable priority score",
    te: "వివరణాత్మక ప్రాథమ్య స్కోరు ప్రకారం రాంక్ చేయబడ్డాయి",
  },
  "dash.catBreak": {
    en: "Issue category breakdown",
    te: "సమస్యల వర్గ విభజన",
  },
  "dash.hotspots": { en: "Location hotspots", te: "ప్రాంతీయ హాట్‌స్పాట్‌లు" },
  "dash.heatmap": { en: "Issue heatmap", te: "సమస్యల హీట్‌మ్యాప్" },
  "dash.heatmapSub": {
    en: "Concentration of submissions across the constituency",
    te: "నియోజకవర్గం అంతటా సమర్పణల కేంద్రీకరణ",
  },
  "dash.rising": { en: "Rising issues", te: "పెరుగుతున్న సమస్యలు" },
  "dash.unverified": {
    en: "Unverified urgent issues",
    te: "ధృవీకరించని అత్యవసర సమస్యలు",
  },
  "dash.unverifiedSub": {
    en: "Need staff verification first",
    te: "ముందుగా సిబ్బంది ధృవీకరణ అవసరం",
  },
  "dash.none": { en: "None right now.", te: "ప్రస్తుతం ఏమీ లేవు." },
  "dash.unverifiedBadge": { en: "unverified", te: "ధృవీకరించబడలేదు" },
  "dash.reportNote": {
    en: "Population figures are public baseline estimates. Some clusters are AI-grouped and not yet staff-verified.",
    te: "జనాభా గణాంకాలు బహిరంగ ప్రాథమిక అంచనాలు. కొన్ని సమూహాలు AI ద్వారా సమూహపరచబడ్డాయి, ఇంకా సిబ్బంది ధృవీకరణ పెండింగ్‌లో ఉంది.",
  },
  "dash.loadingMap": { en: "Loading map...", te: "మ్యాప్ లోడ్ అవుతోంది..." },

  "pub.title": { en: "Public Issue Tracker", te: "బహిరంగ సమస్యల ట్రాకర్" },
  "pub.desc": {
    en: "Anonymized local issue clusters and public updates. No personal data, names, phone numbers, raw complaints or home locations are shown.",
    te: "అనామక స్థానిక సమస్యల సమూహాలు మరియు బహిరంగ అప్‌డేట్‌లు. వ్యక్తిగత సమాచారం, పేర్లు, ఫోన్ నంబర్లు, ముడి ఫిర్యాదులు లేదా ఇంటి చిరునామాలు చూపబడవు.",
  },
  "pub.all": { en: "All", te: "అన్నీ" },
  "pub.loading": { en: "Loading...", te: "లోడ్ అవుతోంది..." },
  "pub.reports": { en: "reports", te: "నివేదికలు" },
  "pub.status": { en: "Status", te: "స్థితి" },
  "pub.updates": { en: "Public updates", te: "బహిరంగ అప్‌డేట్‌లు" },
  "pub.none": {
    en: "No public issues to show yet.",
    te: "ఇంకా చూపించే బహిరంగ సమస్యలు లేవు.",
  },
  "pub.constituency": { en: "Constituency", te: "నియోజకవర్గం" },

  "trust.confidence": { en: "Confidence: {level}", te: "విశ్వసనీయత: {level}" },
  "trust.dataUsed": {
    en: "Data used: {n} source(s)",
    te: "వాడిన డేటా: {n} ఆధారాలు",
  },
  "trust.staffVerified": { en: "Staff verified", te: "సిబ్బంది ధృవీకరించారు" },
  "trust.unverified": {
    en: "Unverified (AI-grouped)",
    te: "ధృవీకరించబడలేదు (AI-సమూహం)",
  },
  "trust.disputed": { en: "Disputed", te: "వివాదాస్పదం" },
  "trust.high": { en: "high", te: "అధికం" },
  "trust.medium": { en: "medium", te: "మధ్యస్థం" },
  "trust.low": { en: "low", te: "తక్కువ" },

  "nav.officer": { en: "Officer Desk", te: "అధికారి డెస్క్" },

  "off.login.title": { en: "Officer login", te: "అధికారి లాగిన్" },
  "off.login.user": { en: "Username", te: "వాడుకరి పేరు" },
  "off.login.pass": { en: "Password", te: "పాస్‌వర్డ్" },
  "off.login.submit": { en: "Login", te: "లాగిన్" },
  "off.login.error": {
    en: "Wrong username or password.",
    te: "తప్పు వాడుకరి పేరు లేదా పాస్‌వర్డ్.",
  },
  "off.login.hint": {
    en: "Demo credentials: officer / officer123",
    te: "డెమో వివరాలు: officer / officer123",
  },
  "off.logout": { en: "Logout", te: "లాగ్అవుట్" },
  "off.queue.title": { en: "Pending applications", te: "పెండింగ్ దరఖాస్తులు" },
  "off.queue.subtitle": {
    en: "Ordered by priority: what needs attention first",
    te: "ప్రాథమ్యత ప్రకారం: ముందు దేనిపై దృష్టి పెట్టాలో",
  },
  "off.queue.empty": {
    en: "No pending applications.",
    te: "పెండింగ్ దరఖాస్తులు లేవు.",
  },
  "off.queue.loading": {
    en: "Loading applications...",
    te: "దరఖాస్తులు లోడ్ అవుతున్నాయి...",
  },
  "off.back": { en: "← Back to queue", te: "← క్యూకు తిరిగి వెళ్ళండి" },
  "off.step.received": { en: "Received", te: "స్వీకరణ" },
  "off.step.details_check": { en: "Details check", te: "వివరాల పరిశీలన" },
  "off.step.field_check": { en: "Field check", te: "క్షేత్ర పరిశీలన" },
  "off.step.decision": { en: "Decision", te: "నిర్ణయం" },
  "off.assist": { en: "Get AI assistance", te: "AI సహాయం పొందండి" },
  "off.assist.loading": {
    en: "Getting AI suggestion...",
    te: "AI సూచన తెస్తోంది...",
  },
  "off.assist.note": {
    en: "The AI suggests; you decide.",
    te: "AI సూచిస్తుంది; నిర్ణయం మీదే.",
  },
  "off.fieldNote": {
    en: "Field note for the AI (optional)",
    te: "AI కోసం క్షేత్ర గమనిక (ఐచ్ఛికం)",
  },
  "off.advance": { en: "Move to next step", te: "తదుపరి దశకు పంపండి" },
  "off.advance.note": {
    en: "Note for this step (optional)",
    te: "ఈ దశ గమనిక (ఐచ్ఛికం)",
  },
  "off.decision.title": { en: "Final decision", te: "తుది నిర్ణయం" },
  "off.decision.approve": { en: "Approve", te: "ఆమోదించండి" },
  "off.decision.reject": { en: "Reject", te: "తిరస్కరించండి" },
  "off.decision.return": { en: "Return", te: "తిరిగి పంపండి" },
  "off.decision.note": {
    en: "Reason (required to reject or return)",
    te: "కారణం (తిరస్కరించడానికి లేదా తిరిగి పంపడానికి తప్పనిసరి)",
  },
  "off.decision.you": {
    en: "The worker always makes the final call.",
    te: "తుది నిర్ణయం ఎల్లప్పుడూ అధికారిదే.",
  },
  "off.decision.approved": { en: "Approved", te: "ఆమోదించబడింది" },
  "off.decision.rejected": { en: "Rejected", te: "తిరస్కరించబడింది" },
  "off.decision.returned": { en: "Returned", te: "తిరిగి పంపబడింది" },
  "off.history": { en: "History", te: "చరిత్ర" },
  "off.history.empty": { en: "No history yet.", te: "ఇంకా చరిత్ర లేదు." },
  "off.ev.moved": { en: "moved this application", te: "దరఖాస్తును ముందుకు పంపారు" },
  "off.ev.assist": { en: "AI suggestion", te: "AI సూచన" },
  "off.ev.decision": { en: "decided", te: "నిర్ణయం తీసుకున్నారు" },
  "off.priority": { en: "priority {n}", te: "ప్రాథమ్యత {n}" },
  "off.error": {
    en: "Something went wrong. Please try again.",
    te: "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
  },

  "cat.Water": { en: "Water", te: "నీటి సరఫరా" },
  "cat.Roads": { en: "Roads", te: "రోడ్లు" },
  "cat.Drainage": { en: "Drainage", te: "మురుగునీరు" },
  "cat.Streetlights": { en: "Streetlights", te: "వీధి దీపాలు" },
  "cat.Pension": { en: "Pension", te: "పింఛన్లు" },
  "cat.Health": { en: "Health", te: "ఆరోగ్యం" },
  "cat.Education": { en: "Education", te: "విద్య" },
  "cat.Sanitation": { en: "Sanitation", te: "పారిశుధ్యం" },
  "cat.Electricity": { en: "Electricity", te: "విద్యుత్" },
  "cat.Other": { en: "Other", te: "ఇతర" },

  "urg.Low": { en: "Low", te: "తక్కువ" },
  "urg.Medium": { en: "Medium", te: "మధ్యస్థం" },
  "urg.High": { en: "High", te: "అధికం" },
  "urg.Critical": { en: "Critical", te: "అత్యవసరం" },

  "trend.increasing": { en: "increasing", te: "పెరుగుతోంది" },
  "trend.decreasing": { en: "decreasing", te: "తగ్గుతోంది" },
  "trend.stable": { en: "stable", te: "స్థిరం" },

  "status.new": { en: "new", te: "కొత్తది" },
  "status.verified": { en: "verified", te: "ధృవీకరించబడింది" },
  "status.forwarded": { en: "forwarded", te: "ఫార్వర్డ్ చేయబడింది" },
  "status.in_progress": { en: "in progress", te: "పురోగతిలో" },
  "status.resolved": { en: "resolved", te: "పరిష్కరించబడింది" },
  "status.closed": { en: "closed", te: "మూసివేయబడింది" },
  "status.submitted": { en: "submitted", te: "సమర్పించబడింది" },
  "status.under_review": { en: "under review", te: "సమీక్షలో" },
  "status.attached_to_cluster": {
    en: "attached to cluster",
    te: "సమూహానికి జోడించబడింది",
  },

  "verif.unverified": { en: "unverified", te: "ధృవీకరించబడలేదు" },
  "verif.staff_verified": {
    en: "staff verified",
    te: "సిబ్బంది ధృవీకరించారు",
  },
  "verif.disputed": { en: "disputed", te: "వివాదాస్పదం" },
};

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "te", setLang: () => {} });

const STORAGE_KEY = "pp-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("te");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "te") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LangContext);
}

/** Translate a dictionary key, with {var} interpolation. */
export function useT() {
  const { lang } = useLanguage();
  return (key: string, vars?: Record<string, string | number>): string => {
    let s = STRINGS[key]?.[lang] ?? STRINGS[key]?.en ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(`{${k}}`, String(v));
      }
    }
    return s;
  };
}

/** Display-label helpers for English data values returned by the API. */
export function catLabel(lang: Lang, value: string): string {
  return STRINGS["cat." + value]?.[lang] ?? value;
}
export function urgLabel(lang: Lang, value: string): string {
  return STRINGS["urg." + value]?.[lang] ?? value;
}
export function trendLabel(lang: Lang, value: string): string {
  return STRINGS["trend." + value]?.[lang] ?? value;
}
export function statusLabel(lang: Lang, value: string): string {
  return STRINGS["status." + value]?.[lang] ?? value;
}
export function verifLabel(lang: Lang, value: string): string {
  return STRINGS["verif." + value]?.[lang] ?? value;
}
