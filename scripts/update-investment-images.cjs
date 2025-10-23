// Update investment images with relevant Unsplash URLs based on type and description
const fs = require('fs');
const path = require('path');

console.log('Generating image URL updates...');

// Map investments to appropriate Unsplash images
const imageMapping = {
  // Agriculture & Food
  '14062510371': 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&auto=format&fit=crop', // Aerofarm - vertical farming
  '10993441873': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop', // Beauté Bridge - cosmetics
  '45331643051': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop', // AgriGenome - agriculture
  '10423127946': 'https://images.unsplash.com/photo-1536964310528-e47dd655ecf3?w=800&auto=format&fit=crop', // SiamGreen Farms - cannabis
  '18647947031': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800&auto=format&fit=crop', // EthicalPalm Africa - palm trees
  '7016119617': 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800&auto=format&fit=crop', // Bloom Sweets - candy/sweets

  // Energy & CleanTech
  '9066524200': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop', // Baltic BioAlgae - renewable energy
  '9362715715': 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop', // CarbonVault - carbon capture
  '29236478765': 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&auto=format&fit=crop', // Verdant Lithium - mining
  '8177377321': 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800&auto=format&fit=crop', // Boreal BioFuels - biofuel plant
  '7016135307': 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop', // NordicH2 - hydrogen energy
  '3294037634': 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop', // AlpenTherm - geothermal
  '12316292917': 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop', // AnatoliaTherm - geothermal
  '5218831622': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop', // Halo Solar - solar panels
  '3033506232': 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&auto=format&fit=crop', // WindLift - wind energy
  '9753736788': 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop', // SimplexH2 - hydrogen
  '3033418208': 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop', // H2 - hydrogen fuel cell
  '17897232404': 'https://images.unsplash.com/photo-1624996752380-8ec242e0f85d?w=800&auto=format&fit=crop', // SolidCore Energy - battery tech
  '4430563235': 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop', // FleetVolt - EV charging
  '50': 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop', // EV Infrastructure

  // Real Estate & Hospitality
  '16619313737': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop', // Community Estates - housing
  '3993548586': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop', // European High Holdings - data center
  '13969523300': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop', // TerraNova Hospitality - hotels
  '15951611223': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop', // Collateral Capital - industrial
  '3033451281': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop', // Étoile Collection - luxury hotel
  '16436801707': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop', // GreenPod Data - data centers

  // Finance & FinTech
  '11764377724': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop', // Atlas Capital - hedge fund
  '14062510978': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop', // Ascendant Capital - hedge fund
  '10423168778': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', // Prism Capital - fintech
  '4431954244': 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop', // Crestline Capital - VC fund
  '6927849729': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop', // JusticePay - legal fintech
  '5725751297': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', // AltaFin - fintech
  '10029719656': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', // Baraka Lend - lending
  '3033540168': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', // Capital Axis - fintech
  '10839377298': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop', // Korona Bridge - lending
  '3033418201': 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format&fit=crop', // BuildFund - real estate lending
  '6586481253': 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop', // Foundry Capital - VC fund
  '14796012117': 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop', // Maghreb Ventures - VC fund
  '3033537001': 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop', // Sterling Ventures - EIS fund
  '12316292637': 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800&auto=format&fit=crop', // Citadel Bank - banking

  // Healthcare & MedTech
  '4048722974': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop', // BioForge - biotech
  '14519190297': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop', // GlucoScan - medical device
  '3169725713': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop', // Juvena - facial rejuvenation
  '9697420646': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&auto=format&fit=crop', // HealPath - wound care
  '3033424554': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop', // Luna Fertility - fertility
  '45197647128': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop', // ConceiveIQ - fertility AI
  '3033506216': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop', // NovaMed Devices - medical device
  '9066524681': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop', // CareLoop - healthcare platform
  '7277316790': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop', // TargetCell - cancer treatment

  // Technology & Software
  '29236479110': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop', // Jamhub - music tech
  '21256265876': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop', // LumiCore - deeptech
  '15103192137': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop', // Decentra - blockchain/AI
  '10423186034': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop', // Vibe3 - web3 social
  '3033421628': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop', // Decentra - blockchain
  '10423128146': 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop', // Enclave - social network
  '14062511246': 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&auto=format&fit=crop', // MirageAI - AI VR
  '44738946913': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop', // ConvertPlay - adtech
  '44738946915': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop', // VoyaBot - travel AI
  '44740149355': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop', // FurnishIQ - furniture ecommerce
  '21256210717': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop', // SkillForge AI - elearning
  '13408806965': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop', // PropelHQ - learning SaaS
  '3033509201': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop', // AeroLean - aviation tech
  '8584936715': 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop', // TrackRenew - rail tech
  '3033540160': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop', // Axiom AI - AI software
  '3033536994': 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&auto=format&fit=crop', // TouchReal - VR/AR
  '8584995136': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop', // RecoMind - retail AI
  '19981888067': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop', // RecoMind - lending
  '3033418206': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop', // GlideFleet - micromobility
  '19696043904': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop', // Bastion Security - cybersecurity
  '10963331673': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop', // CredenceChain - blockchain
  '3033418204': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop', // Liquid Spaces - proptech
  '3033506230': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', // FluidAsset - SaaS fintech
  '3033506226': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop', // SequenceGuard - wealthtech
  '3033509193': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop', // GuardianGate - security SaaS

  // Food & Beverage
  '9697420928': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop', // Cloudchefs - cloud kitchen
  '30657742418': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop', // StreamForge - media tech

  // Manufacturing & Industrial
  '11764378192': 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop', // Pangea Graphite - mining
  '6552021596': 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=800&auto=format&fit=crop', // Deepwater Seaport - port
  '7584774280': 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800&auto=format&fit=crop', // Digital Bank SPAC
  '5218840179': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop', // Disruptive Holistic - hospitality
  '5595119750': 'https://images.unsplash.com/photo-1624996752380-8ec242e0f85d?w=800&auto=format&fit=crop', // IonForge - battery tech
  '10839351315': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop', // Enterprise Performance - learning
  '3033478346': 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format&fit=crop', // Experienced European - lending
  '19398820450': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop', // SlotSync - scheduling
  '7805091179': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop', // Growwell - agritech
  '8584955921': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop', // Summit Heating - plumbing
  '11083743119': 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&auto=format&fit=crop', // Mineral Deposits - mining
  '14796001590': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop', // Nano Paste - solar manufacturing
  '3033464798': 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&auto=format&fit=crop', // AlloyStream Mining
  '34457702550': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop', // TitanLayer - 3D printing

  // Consumer & Retail
  '4429276014': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop', // Consumer Litigation
  '5218840179': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop', // Hospitality tech
  '3033401657': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop', // DirectStay - hotel booking
  '6257632625': 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop', // LegacyPlan - funeral planning
  '44740149357': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop', // ReHabitat - sustainable housing
  '8177374608': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop', // EcoServe - eco tableware

  // Gaming & Entertainment
  '3033451278': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop', // ArenaX - esports
  '15484050227': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop', // Apex Play - iGaming
  '29468147298': 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop', // Constellation Digital - crypto fund

  // HR & Recruitment
  '9362715964': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop', // Flex Talent - recruitment
  '3033464799': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop', // ThinkSync - collaboration
};

// Generate UPDATE statements
const updates = [];
for (const [id, imageUrl] of Object.entries(imageMapping)) {
  updates.push(`UPDATE investments SET image_url = '${imageUrl}' WHERE id = '${id}';`);
}

const sqlContent = `-- Update investment images with relevant Unsplash URLs
-- Generated: ${new Date().toISOString().split('T')[0]}
-- This migration updates ${updates.length} investment image URLs

${updates.join('\n')}
`;

// Write to file
const outputPath = path.join(__dirname, '../db/migration-update-images.sql');
fs.writeFileSync(outputPath, sqlContent, 'utf8');

console.log(`✅ Generated migration SQL with ${updates.length} image updates`);
console.log(`   File: ${outputPath}`);
console.log('\nTo apply this migration, run:');
console.log('   npm run db:migrate:images');
