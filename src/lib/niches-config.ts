// Massive niche/sub-niche configuration for CALIGON
export interface NicheConfig {
  label: string;
  subniches: string[];
}

export const NICHES_CONFIG: Record<string, NicheConfig> = {
  // ALIMENTAÇÃO
  restaurante: { label: "Restaurante", subniches: ["À la carte", "Self-service", "Fast food", "Delivery only", "Dark kitchen", "Food truck", "Buffet", "Rodízio", "Cafeteria", "Padaria", "Confeitaria", "Pizzaria", "Hamburgueria", "Sorveteria", "Bar e petiscaria", "Restaurante japonês", "Churrascaria", "Vegano/vegetariano", "Marmitaria", "Cantina escolar"] },
  // SAÚDE
  clinica: { label: "Clínica", subniches: ["Clínica médica geral", "Odontologia", "Estética", "Fisioterapia", "Psicologia", "Oftalmologia", "Dermatologia", "Ortopedia", "Ginecologia", "Pediatria", "Nutrição", "Fonoaudiologia", "Veterinária", "Laboratório de análises", "Clínica de imagem", "Home care", "Acupuntura", "Pilates/RPG", "Clínica multidisciplinar", "Medicina do trabalho"] },
  hospital: { label: "Hospital", subniches: ["Hospital geral", "Maternidade", "Hospital infantil", "Pronto-socorro", "Hospital de olhos", "Hospital ortopédico", "Centro cirúrgico", "UTI", "Hospital psiquiátrico", "Hospital veterinário"] },
  farmacia: { label: "Farmácia", subniches: ["Farmácia de bairro", "Rede de farmácias", "Farmácia de manipulação", "Drogaria", "Farmácia hospitalar", "Farmácia veterinária", "Homeopatia"] },
  // IMOBILIÁRIO
  imobiliaria: { label: "Imobiliária", subniches: ["Venda de imóveis", "Locação residencial", "Locação comercial", "Administração de condomínio", "Incorporadora", "Loteadora", "Imóveis de luxo", "Imóveis populares", "Imóveis rurais", "Coworking", "Temporada/Airbnb"] },
  construtora: { label: "Construção Civil", subniches: ["Residencial", "Comercial", "Industrial", "Reforma", "Manutenção predial", "Infraestrutura", "Acabamento", "Elétrica", "Hidráulica", "Pintura", "Paisagismo", "Terraplanagem", "Estrutura metálica", "Pré-moldados", "Construção a seco"] },
  // VAREJO
  varejo: { label: "Varejo", subniches: ["Supermercado", "Minimercado", "Conveniência", "Loja de roupas", "Loja de calçados", "Ótica", "Joalheria", "Brinquedos", "Papelaria", "Livraria", "Loja de informática", "Loja de celulares", "Loja de móveis", "Decoração", "Pet shop", "Loja de materiais de construção", "Ferragem", "Autopeças", "Loja de cosméticos", "Floricultura", "Bazar", "Loja de presentes", "Artesanato", "Atacado", "Atacarejo", "Loja de departamento", "Outlet"] },
  // E-COMMERCE
  ecommerce: { label: "E-commerce", subniches: ["Marketplace próprio", "Seller em marketplace", "D2C (direct to consumer)", "Dropshipping", "Assinatura/clube", "Infoprodutos", "E-commerce B2B", "E-commerce de moda", "E-commerce de alimentos", "E-commerce de eletrônicos", "E-commerce de cosméticos", "E-commerce de artesanato", "Print on demand", "Loja virtual multimarca", "Social commerce"] },
  // LOGÍSTICA
  logistica: { label: "Logística", subniches: ["Transportadora", "Courier/last mile", "Fulfillment", "Armazenagem", "Cross-docking", "Logística reversa", "Logística frigorificada", "Mudanças", "Fretamento", "Motoboy/entregas rápidas", "Operador logístico (3PL)", "Distribuição", "Importação/exportação", "Despachante aduaneiro", "Logística de eventos"] },
  // INDÚSTRIA
  industria: { label: "Indústria", subniches: ["Alimentos e bebidas", "Têxtil e confecção", "Metalúrgica", "Plásticos", "Química", "Farmacêutica", "Cosméticos", "Papel e celulose", "Moveleira", "Calçadista", "Eletrônica", "Automotiva", "Gráfica", "Embalagens", "Reciclagem", "Vidro", "Cerâmica", "Borracha", "Maquinário", "Ferramentaria", "Usinagem"] },
  // AGÊNCIAS E SERVIÇOS CRIATIVOS
  agencia: { label: "Agência", subniches: ["Marketing digital", "Publicidade", "Branding", "Social media", "SEO/SEM", "Performance", "Design gráfico", "Produção audiovisual", "Eventos", "Relações públicas", "Conteúdo", "Influenciadores", "Growth hacking", "Endomarketing", "Trade marketing", "Agência full service"] },
  // EDUCAÇÃO
  educacao: { label: "Educação", subniches: ["Escola particular", "Curso de idiomas", "Curso preparatório", "Faculdade/universidade", "EAD", "Escola técnica", "Creche", "Reforço escolar", "Escola de música", "Escola de dança", "Autoescola", "Curso profissionalizante", "Treinamento corporativo", "Mentoria", "Coaching", "Escola de esportes", "Escola de artes"] },
  // TECNOLOGIA
  tecnologia: { label: "Tecnologia", subniches: ["SaaS", "Software house", "Fábrica de software", "Consultoria de TI", "Infraestrutura/cloud", "Cibersegurança", "Data analytics", "IA/Machine learning", "Mobile apps", "Games", "IoT", "Blockchain", "Fintech", "Healthtech", "Edtech", "Legaltech", "Proptech", "Agritech", "Martech", "Regtech", "E-commerce tech", "DevOps/SRE"] },
  // SERVIÇOS PROFISSIONAIS
  contabilidade: { label: "Contabilidade", subniches: ["Escritório contábil", "BPO financeiro", "Consultoria tributária", "Auditoria", "Perícia contábil", "Consultoria societária", "Planejamento tributário", "Contabilidade digital", "Abertura de empresas"] },
  advocacia: { label: "Advocacia", subniches: ["Cível", "Trabalhista", "Tributário", "Empresarial", "Família", "Criminal", "Imobiliário", "Digital/LGPD", "Propriedade intelectual", "Previdenciário", "Ambiental", "Consumidor", "Recuperação judicial"] },
  consultoria: { label: "Consultoria", subniches: ["Gestão empresarial", "Estratégia", "Processos", "RH e pessoas", "Financeira", "Comercial/vendas", "Supply chain", "Qualidade (ISO)", "Ambiental", "Segurança do trabalho", "ESG", "Inovação", "Transformação digital"] },
  // BELEZA E BEM-ESTAR
  beleza: { label: "Beleza e Estética", subniches: ["Salão de beleza", "Barbearia", "Clínica de estética", "Spa", "Studio de unhas", "Studio de sobrancelhas", "Micropigmentação", "Depilação", "Bronzeamento", "Podologia", "Visagismo", "Estética corporal", "Estética facial"] },
  // ACADEMIA E ESPORTE
  academia: { label: "Academia e Esporte", subniches: ["Musculação", "Crossfit", "Funcional", "Pilates", "Yoga", "Natação", "Artes marciais", "Dança", "Box", "Spinning", "Personal trainer", "Studio de treino", "Escola de esportes", "Centro esportivo", "Clube"] },
  // TURISMO E HOTELARIA
  turismo: { label: "Turismo e Hotelaria", subniches: ["Hotel", "Pousada", "Resort", "Hostel", "Agência de viagens", "Turismo receptivo", "Ecoturismo", "Turismo de aventura", "Guia turístico", "Transfer/shuttle", "Aluguel de temporada", "Eventos corporativos", "Casa de festas", "Motel"] },
  // AUTOMOTIVO
  automotivo: { label: "Automotivo", subniches: ["Oficina mecânica", "Funilaria e pintura", "Loja de autopeças", "Concessionária", "Locadora de veículos", "Lava-rápido", "Estacionamento", "Despachante veicular", "Borracharia", "Elétrica automotiva", "Envelopamento", "Blindagem", "Som automotivo", "Revenda de usados"] },
  // AGRONEGÓCIO
  agronegocio: { label: "Agronegócio", subniches: ["Agricultura", "Pecuária", "Avicultura", "Suinocultura", "Aquicultura", "Agroindustria", "Agrocomércio", "Fertilizantes", "Sementes", "Defensivos", "Máquinas agrícolas", "Irrigação", "Consultoria agrícola", "Cooperativa agrícola", "Orgânicos"] },
  // SERVIÇOS GERAIS
  servicos: { label: "Serviços Gerais", subniches: ["Limpeza", "Segurança patrimonial", "Jardinagem", "Manutenção predial", "Dedetização", "Portaria/recepção", "Catering", "Lavanderia", "Costura/alfaiataria", "Chaveiro", "Encanador", "Eletricista", "Marcenaria", "Serralheria", "Vidraçaria", "Assistência técnica", "Instalação de ar-condicionado"] },
  // FINANÇAS
  financeiro: { label: "Serviços Financeiros", subniches: ["Assessoria de investimentos", "Corretora de seguros", "Factoring", "Crédito consignado", "Câmbio", "Gestora de patrimônio", "Financeira", "Cooperativa de crédito", "Previdência privada", "Consórcio", "Cobrança", "Antecipação de recebíveis"] },
  // COMUNICAÇÃO E MÍDIA
  midia: { label: "Comunicação e Mídia", subniches: ["Rádio", "TV", "Jornal", "Revista", "Portal de notícias", "Podcast", "Produtora de vídeo", "Produtora de áudio", "Fotografia", "Editora", "Gráfica", "Sinalização", "OOH/mídia exterior"] },
  // ENERGIA E SUSTENTABILIDADE
  energia: { label: "Energia", subniches: ["Solar fotovoltaica", "Eólica", "Biomassa", "Eficiência energética", "Distribuição de energia", "Gás", "Instalação elétrica industrial", "Gerador", "Iluminação", "Manutenção de usinas"] },
  // SOCIAL E ONG
  social: { label: "Social/ONG", subniches: ["ONG", "Associação", "Instituto", "Fundação", "Cooperativa", "Sindicato", "Conselho", "Projeto social", "Empreendedorismo social"] },
  // GOVERNO E PÚBLICO
  governo: { label: "Setor Público", subniches: ["Prefeitura", "Secretaria", "Autarquia", "Empresa pública", "Economia mista", "Consórcio público", "Câmara municipal", "Tribunal", "Cartório"] },
  // SEGUROS
  seguros: { label: "Seguros", subniches: ["Auto", "Vida", "Saúde", "Residencial", "Empresarial", "Transporte/carga", "Viagem", "Responsabilidade civil", "Garantia", "Agrícola", "Multirriscos"] },
  // TELECOM
  telecom: { label: "Telecomunicações", subniches: ["Provedor de internet", "Telefonia", "TV a cabo/streaming", "Infraestrutura de rede", "Data center", "VoIP", "IoT connectivity"] },
  // MINERAÇÃO
  mineracao: { label: "Mineração", subniches: ["Mineração de ferro", "Ouro", "Calcário", "Areia e brita", "Gemas", "Beneficiamento mineral", "Geologia e pesquisa mineral"] },
  // MODA
  moda: { label: "Moda", subniches: ["Confecção", "Estilismo", "Modelagem", "Atacado de moda", "Moda praia", "Moda fitness", "Moda infantil", "Moda plus size", "Acessórios", "Bolsas", "Lingerie", "Jeans", "Uniformes", "Moda sustentável"] },
  // ENTRETENIMENTO
  entretenimento: { label: "Entretenimento", subniches: ["Cinema", "Teatro", "Parque de diversões", "Parque aquático", "Boliche", "Escape room", "Karaokê", "Casa de shows", "Produtora de eventos", "Circo", "Museu", "Galeria de arte", "Festival"] },
  // PETS
  pets: { label: "Pets", subniches: ["Pet shop", "Clínica veterinária", "Hotel/creche animal", "Banho e tosa", "Adestramento", "Dog walker", "Ração e suplementos", "Acessórios pet", "Criação de animais", "Pet sitter"] },
};

export const PROCESS_CATEGORIES = [
  { value: "comercial", label: "Comercial / Vendas" },
  { value: "atendimento", label: "Atendimento ao Cliente" },
  { value: "operacao", label: "Operação / Produção" },
  { value: "financeiro", label: "Financeiro" },
  { value: "logistica", label: "Logística / Distribuição" },
  { value: "rh", label: "RH / Gestão de Pessoas" },
  { value: "compras", label: "Compras / Suprimentos" },
  { value: "marketing", label: "Marketing" },
  { value: "tecnologia", label: "Tecnologia / TI" },
  { value: "producao", label: "Produção / Manufatura" },
  { value: "qualidade", label: "Qualidade" },
  { value: "administrativo", label: "Administrativo" },
  { value: "juridico", label: "Jurídico" },
  { value: "projetos", label: "Gestão de Projetos" },
  { value: "outro", label: "Outro" },
];

export function getNicheLabel(nicheKey: string): string {
  return NICHES_CONFIG[nicheKey]?.label || nicheKey;
}

export function getSubniches(nicheKey: string): string[] {
  return NICHES_CONFIG[nicheKey]?.subniches || [];
}

export function getAllNicheKeys(): string[] {
  return Object.keys(NICHES_CONFIG);
}

export function searchNiches(query: string): { key: string; label: string }[] {
  const q = query.toLowerCase();
  return Object.entries(NICHES_CONFIG)
    .filter(([_, v]) => v.label.toLowerCase().includes(q))
    .map(([key, v]) => ({ key, label: v.label }));
}
