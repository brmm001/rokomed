import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi, userApi } from '../lib/api'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import {
  Building2, GraduationCap, Stethoscope, Calendar,
  ChevronRight, ChevronLeft, CheckCircle2, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

function Typewriter({ text, speed = 25 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const activeRef = useRef(true)

  useEffect(() => {
    activeRef.current = true
    setDisplayedText('')
    setIsTyping(true)
    let i = 0

    const tick = () => {
      if (!activeRef.current) return
      i++
      setDisplayedText(text.slice(0, i))
      if (i >= text.length) {
        setIsTyping(false)
        return
      }
      setTimeout(tick, speed)
    }

    const id = setTimeout(tick, speed)

    return () => {
      activeRef.current = false
      clearTimeout(id)
    }
  }, [text, speed])

  return (
    <span>
      {displayedText}
      {isTyping && (
        <>
          <style>{`
            @keyframes typewriter-blink {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
          `}</style>
          <span 
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1em',
              backgroundColor: 'currentColor',
              marginLeft: '2px',
              verticalAlign: 'middle',
              animation: 'typewriter-blink 0.8s infinite'
            }} 
          />
        </>
      )}
    </span>
  )
}

// ── Lista de faculdades de medicina do Brasil ────────────────────────────────
const MEDICAL_SCHOOLS = [
  'AFYA FACULDADE DE CIÊNCIAS MÉDICAS DA PARAÍBA',
  'Afya Faculdade de Ciências Médicas de Abaetetuba',
  'AFYA Faculdade de Ciências Médicas de Bragança',
  'Afya Faculdade de Ciências Médicas de Garanhuns',
  'Afya Faculdade de Ciências Médicas de Ipatinga',
  'AFYA FACULDADE DE CIÊNCIAS MÉDICAS DE ITABUNA',
  'Afya Faculdade de Ciências Médicas de Itacoatiara',
  'AFYA FACULDADE DE CIÊNCIAS MÉDICAS DE JABOATÃO DOS GUARARAPES',
  'Afya Faculdade de Ciências Médicas de Manacapuru',
  'AFYA FACULDADE DE CIÊNCIAS MÉDICAS DO PARÁ - FACIMPA',
  'Centro de Ensino Superior Morgana Potrich Eireli - FAMP (SUB JUDICE)',
  'Centro Univ.p/ o Desenvolvimento do Alto Vale do Itajaí - SC - UNIDAVI',
  'Centro Universitário AGES',
  'Centro Universitário Aparício Carvalho - FIMCA',
  'Centro Universitário Assis Gurgacz - Cascavel/PR - FAG',
  'Centro Universitário Atenas - Paracatu-MG - UNIATENAS',
  'Centro Universitário Barão de Mauá- Ribeirão Preto - SP -UFBM',
  'Centro Universitário Campo Limpo Paulista',
  'Centro Universitário Campo Real - Guarapuava PR- CAMPO REAL',
  'Centro Universitário Católico Salesiano Aux- UNISALESIANO - Camp Araçatuba.SP,',
  'Centro Universitário Cesmac - Maceió - CESMAC',
  'Centro Universitário CEUNI-FAMETRO - FAMETRO - Manaus-AM',
  'Centro Universitário Claretiano - Rio Claro.SP - CEUCLAR',
  'Centro Universitário das Faculdade Associadas de Ensino - FAE - S.João da Boa Vista/SP- UNIFAE',
  'Centro Universitário de Adamantina/SP - FAI',
  'Centro Universitário de Anápolis - GO - UniEVANGÉLICA',
  'Centro Universitário de Araraquara-SP - UNIARA',
  'Centro Universitário de Belo Horizonte/MG - UNI-BH',
  'Centro Universitário de Brasília - UNICEUB',
  'Centro Universitário de Caratinga -MG - UNEC',
  'Centro Universitário de Goiatuba - GO',
  'Centro Universitário de Indaiatuba - UniMAX - Grupo UniEduK',
  'Centro Universitário de Jaguariúna - UniFAJ - Grupo UniEduK',
  'Centro Universitário de João Pessoa - PB - UNIPE',
  'CENTRO UNIVERSITÁRIO DE MACEIÓ - UNIMA',
  'Centro Universitário de Manhuaçu/MG - UNIFACIG',
  'Centro Universitário de Mineiros - UNIFIMES (GO)',
  'Centro Universitário de Mineiros - UNIFIMES-Trindade -GO',
  'Centro Universitário de Patos - UNIFIP',
  'Centro Universitário de Patos de Minas - UNIPAM',
  'Centro Universitário de Santa Fé do Sul - SP - UNIFUNEC',
  'Centro Universitário de Valença - UNIFAA',
  'Centro Universitário de Várzea Grande - MT - UNIVAG',
  'Centro Universitário de Volta Redonda- RJ - UNIFOA',
  'Centro Universitário de Votuporanga - SP - UNIFEV',
  'Centro Universitário do Espirito Santo- Colatina - UNESC',
  'Centro Universitário do Estado do Pará - PA - CESUPA',
  'Centro Universitário do Planalto Central Apparecido dos Santos – UNICEPLAC',
  'Centro Universitário do Vale do Araguaia',
  'Centro Universitário Dom Pedro II',
  'Centro Universitário Estácio de Ribeirão Preto',
  'Centro Universitário Ingá -Maringá/PR - INGÁ',
  'Centro Universitário INTA-UNINTA - Sobral/CE',
  'Centro Universitário Integrado de Campo Mourão - PR',
  'Centro Universitário Lusíada- Santos - UNILUS',
  'Centro Universitário Mauricio de Nassau - UNINASSAU - PE',
  'Centro Universitário Municipal de Franca - FRANCA - SP - Uni-FACEF',
  'Centro Universitário Padre Albino - Catanduva - SP - UNIFIPA',
  'Centro Universitário Presidente Tancredo de Almeida Neves - S.João del Rei /MG - UNIPTAN',
  'Centro Universitário Redentor - Itaperuna/RJ - UNIREDENTOR',
  'Centro Universitário Santa Maria - FSM - Cajazeiras/PB',
  'Centro Universitário São Camilo - São Paulo/SP - SÃO CAMILO',
  'CENTRO UNIVERSITÁRIO SÃO LUCAS PORTO VELHO (SÃO LUCAS PVH)',
  'Centro Universitário Serra dos Órgãos - Teresópolis/RJ - UNIFESO',
  'Centro Universitário Sudoeste Paulista',
  'Centro Universitário Tiradentes de Pernambuco',
  'Centro Universitário Tocantinense Presidente Antônio Carlos',
  'Centro Universitário Unichristus - Fortaleza - UNICHRISTUS',
  'Centro Universitário Unidade de Ensino Superior Dom Bosco',
  'Centro Universitário UNIFACIMED',
  'Centro Universitário UNIFAGOC - UNIFAGOC - UBÁ/MG',
  'Centro Universitário UniFG- Guanambi - BA',
  'Centro Universitário Uninorte- Rio Branco/AC - UNINORTE',
  'Centro Universitário Uninovafapi - Piauí - UNINOVAFAPI',
  'Centro Universitário Unirg - GurupiTO - UNIRG',
  'Centro Universitário Univates - Lajeado - RS - UNIVATES',
  'Centro Universitário-Instituto Euro Americano de Educação Ciência Tecnologia SCES',
  'Escola Bahiana de Medicina e Saúde Pública - Salvador- EBMSP',
  'Escola de Medicina Souza Marques - Rio de Janeiro/RJ - EMSM',
  'Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória - EMESCAM',
  'Escola Superior de Ciências da Saúde - Brasília - ESCS',
  'Faculdade AGES de Medicina -- JACOBINA/BA - FAM',
  'Faculdade AGES de Medicina de Irecê',
  'Faculdade Alfredo Nasser - Aparecida de Goiania - GO - UNIFAN',
  'Faculdade Atenas-Passos - MG',
  'Faculdade Brasileira - Vitória/ES - MULTIVIX VITORIA',
  'Faculdade da Saúde e Ecologia Humana - Vespasiano - MG - FASEH',
  'Faculdade das Américas - São Paulo/SP - FAM',
  'Faculdade de Ciências Aplicadas e Sociais de Petrolina',
  'Faculdade de Ciências da Saúde de Barretos Dr. Paulo Prata - FACISB',
  'Faculdade de Ciências da Saúde Sírio-Libanês',
  'Faculdade de Ciências e Saúde Edufor - EDUFOR',
  'Faculdade de Ciências Humanas, Exatas e da Saúde do Piauí - FAHESP/iESVAP',
  'Faculdade de Ciências Médicas da Santa Casa de São Paulo/SP - FCMSCSP',
  'Faculdade de Ciências Médicas de Campina Grande - PB - Unifacisa',
  'Faculdade de Ciências Médicas de Minas Gerais- FELUMA - FCMMG -',
  'Faculdade de Ciências Médicas de São José dos Campos - SP - HUMANITAS',
  'Faculdade de Ciências Médicas e da Saúde de Juiz de Fora-MG - SUPREMA',
  'Faculdade de Educação e Cultura de Vilhena - VILHENA/RO',
  'Faculdade de Ensino Superior da Amazônia Reunida- FESAR',
  'Faculdade de Medicina - FATRA',
  'Faculdade de Medicina - Unoeste- Campus/Guarujá/SP',
  'Faculdade de Medicina de Barbacena/MG - FAME',
  'Faculdade de Medicina de Campos - RJ - FMC',
  'Faculdade de Medicina de Itajubá-MG - FMIt',
  'Faculdade de Medicina de Jundiaí-SP - FMJ',
  'Faculdade de Medicina de Marília-SP - FAMEMA',
  'Faculdade de Medicina de Olinda/PE - FMO',
  'Faculdade de Medicina de Penápolis - FUNEPE',
  'Faculdade de Medicina de Petrópolis - UNIFASE',
  'Faculdade de Medicina de São José do Rio Preto -SP - FAMERP',
  'Faculdade de Medicina de Toledo - PR',
  'Faculdade de Medicina do ABC',
  'Faculdade de Medicina do Sertão',
  'Faculdade de Medicina Estácio de Juazeiro do Norte/CE ESTÁCIO FMJ',
  'Faculdade de Medicina FACERES - São José do Rio Preto - SP',
  'Faculdade de Medicina Nova Esperança- J.Pessoa/ PB - FAMENE',
  'Faculdade de Medicina Pitágoras de Eunápolis',
  'Faculdade de Minas BH - FAMINAS - MG',
  'Faculdade de Saúde Santo Agostinho de Vitoria da Conquista - BA - FASA',
  'Faculdade de Tecnologia e Ciências-Salvador/BA - FTC',
  'Faculdade Dinâmica do Vale do Piranga- Ponte Nova/MG - FADIP',
  'Faculdade Estácio de Alagoinhas',
  'Faculdade Estácio de Jaraguá do Sul - Jaraguá do Sul -SC - ESTÁCIO/JARAGUÁ',
  'Faculdade Estácio de Juazeiro',
  'Faculdade Estácio do Pantanal - Estácio FAPAN',
  'Faculdade Evangélica Mackenzie do Paraná - Curitiba - FEMPAR',
  'Faculdade Integrado de Macapá/AP',
  'Faculdade Israelita de Ciências da Saúde Albert Einsten - São Paulo/SP - FICSAE',
  'Faculdade Metropolitana da Amazônia - FAMAZ - PA',
  'Faculdade Metropolitana São Carlos BJI - B.J.Itabapoana-RJ - FAMESC',
  'Faculdade Multivix Cachoeiro de Itapemirim',
  'Faculdade Municipal de Medicina Prof. Franco Montoro - Mogi Guaçu',
  'Faculdade Nova Esperança de Mossoro - RN - FACENE/RN',
  'Faculdade Paraíso Araripina',
  'Faculdade Pernambucana de Saúde/Recife - FPS',
  'Faculdade Pitágoras - Codó - Maranhão',
  'Faculdade Presidente Antonio Carlos - Porto Nacional - ITPAC-PORTO/FAPAC',
  'Faculdade Santa Marcelina - FASM',
  'Faculdade São Leopoldo Mandic - ARARAS - SP - FMANDIC',
  'Faculdade São Leopoldo Mandic -Campinas/ SLMANDIC',
  'Faculdade São Leopoldo Mandic de Limeira',
  'Faculdade Sete Lagoas - MG - Atenas Sete Lagoas',
  'Faculdade Tiradentes de Goiana - FITS',
  'Faculdade União Araruama de Ensino S/S Ltda',
  'Faculdade Unifadra Dracena - UNIFADRA-SP',
  'Faculdade Vértice - Matipó',
  'Faculdades Integradas Aparício Carvalho- Porto Velho/RO - FIMCA',
  'Faculdades Integradas Padrão - FIP Guanambi',
  'Faculdades Pequeno Principe - FPP - Curitiba/PR',
  'Fundação Educacional do Município de Assis - SP - FEMA',
  'Fundação Universidade Federal de Rondônia - UNIR',
  'Fundação Universidade Federal de Viçosa - MG - UFV',
  'Fundação Universidade Federal do Vale do São Francisco - Paulo Afonso/BA',
  'Instituto de Ciências da Saúde - Montes Claros - MG -ICS/ FUNORTE',
  'Instituto Presidente Antonio Carlos - Palmas/TO - ITPAC',
  'ITPAC Cruzeiro do Sul',
  'Pontifícia Universidade Católica de Campinas - PUC-CAMPINAS',
  'Pontifícia Universidade Católica de Goiás - PUC-GO',
  'Pontifícia Universidade Católica de Minas Gerais - Betim/MG - PUCMINAS',
  'Pontifícia Universidade Católica de Minas Gerais- PUC - CONTAGEM- MG',
  'Pontifícia Universidade Católica de Minas Gerais- PUC Poços de Caldas - MG',
  'Pontifícia Universidade Católica de São Paulo - Campus Sorocaba- PUC-SP',
  'Pontifícia Universidade Católica do Paraná - Curitiba - PUC-PR',
  'Pontifícia Universidade Católica do Paraná - Londrina - PUC PR',
  'Pontifícia Universidade Católica do Paraná - Toledo - PUC PR',
  'Pontificia Universidade Católica do Rio Grande do Sul - PUC-RS',
  'Suprema Faculdade de Ciências Médicas de Três Rios-RJ',
  'Uni-Faminas Minas - FAMINAS/Muriaé - MG',
  'União das Faculdades dos Grandes Lagos - S. José do Rio Preto - SP - UNILAGO',
  'UNIFIPMoc - Centro Universitário FIPMoc',
  'Unime Lauro de Freitas',
  'UNIVEL Centro Universitário',
  'Universidade Alto Vale do Rio do Peixe - SC - UNIARP',
  'Universidade Anhanguera-Uniderp - MS - UNIDERP',
  'Universidade Anhembi Morumbi - São Paulo/SP - UAM',
  'Universidade Anhembi-Morumbi - UAM - PIRACICABA.SP',
  'Universidade Anhembi-Morumbi - UAM - São José dos Campos - SP',
  'Universidade Brasil - Fernandópolis/SP',
  'Universidade Castelo Branco',
  'Universidade Católica de Brasília',
  'Universidade Católica de Pelotas-RS - UCPEL',
  'Universidade Católica de Pernambuco - UNICAP',
  'Universidade Ceuma - Imperatriz/MA - UNICEUMA./IMPERATRIZ',
  'Universidade Cidade de São Paulo - UNICID',
  'Universidade Comunitária da Região de Chapecó/SC - UNOCHAPECÓ',
  'Universidade da Região de Joinville - UNIVILLE',
  'Universidade de Brasília - DF - UNB',
  'Universidade de Brusque - SC - UNIFEBE',
  'Universidade de Caxias do Sul/RS - UCS',
  'Universidade de Cuiabá/MT - UNIC',
  'Universidade de Fortaleza - CE - UNIFOR',
  'Universidade de Franca - UNIFRAN - SP',
  'Universidade de Gurupi - Campus Paraíso - UNIRG',
  'Universidade de Itaúna - UIt',
  'Universidade de Marília/SP - UNIMAR',
  'Universidade de Maringá - CESUMAR',
  'Universidade de Mogi das Cruzes - UMC',
  'Universidade de Passo Fundo/RS - UPF',
  'Universidade de Pato Branco - Pato Branco. PR - UNIDEP',
  'Universidade de Pernambuco -UPE/Serra Talhada (PE)',
  'Universidade de Pernambuco-/Recife - UPE',
  'Universidade de Pernambuco/Garanhuns - UPE',
  'Universidade de Ribeirão Preto - UNAERP',
  'Universidade de Ribeirão Preto - UNAERP - Campus Guarujá',
  'Universidade de Rio Verde - Aparecida de Goiania - GO UniRV',
  'Universidade de Rio Verde - UniRV - Rio Verde/GO',
  'Universidade de Rio Verde - UniRV/GO - Goianésia',
  'Universidade de Rio Verde -Formosa- Unirv -',
  'Universidade de Santa Cruz do Sul - RS -UNISC',
  'Universidade de Santo Amaro - SP - UNISA',
  'Universidade de São Caetano do Sul - USCS - S.Paulo',
  'Universidade de São Paulo - Campus Ribeirão Preto - USP-RP',
  'Universidade de São Paulo - Campus São Paulo - USP-SP',
  'Universidade de São Paulo - USP - Baurú',
  'Universidade de Taubaté - UNITAU',
  'Universidade de Uberaba - MG - UNIUBE',
  'Universidade de Vassouras - RJ',
  'Universidade do Ceuma-UNICEUMA',
  'Universidade do Contestado - Mafra-SC - UcN',
  'Universidade do Estado da Bahia - Cabula/Salvador - UNEB',
  'Universidade do Estado de Mato Grosso - UNEMAT',
  'Universidade do Estado de Minas Gerais- UEMG/PASSOS',
  'Universidade do Estado do Amazonas -Manaus - UEA',
  'Universidade do Estado do Pará - Belem/PA - UEPA',
  'Universidade do Estado do Pará - Santarém/PA - UEPA',
  'Universidade do Estado do Pará - UEPA / Marabá',
  'Universidade do Estado do Rio de Janeiro - UERJ',
  'Universidade do Estado do Rio Grande do Norte - Mossoró/RN - UERN',
  'Universidade do Extremo Sul Catarinense - Criciúma - UNESC',
  'Universidade do Grande Rio Professor José de Souza Herdy - Duque de Caxias/RJ- UNIGRANRIO',
  'Universidade do Grande Rio Professor José de Souza Herdy - RJ - UNIGRANRIO',
  'Universidade do Oeste de Santa Catarina - Joaçaba - UNOESC',
  'Universidade do Oeste Paulista - JAÚ - SÃO PAULO',
  'Universidade do Oeste Paulista - Presidente Prudente - UNOESTE',
  'Universidade do Planalto Catarinense - Lages - UNIPLAC',
  'Universidade do Sul de Santa Catarina - Palhoça/SC - UNISUL',
  'Universidade do Sul de Santa Catarina- Campus Tubarão - UNISUL',
  'Universidade do Vale do Itajaí - SC - UNIVALI',
  'Universidade do Vale do Rio dos Sinos - São Leopoldo. RS - UNISINOS',
  'Universidade do Vale do Sapucaí - Pouso Alegre/MG - UNIVAS',
  'Universidade Estácio de Sá - Angra dos Reis. RJ - UNESA',
  'Universidade Estácio de Sá - Campus João Uchoa - RJ - UNESA',
  'Universidade Estácio de Sá - RJ - UNESA',
  'Universidade Estadual de Campinas - UNICAMP',
  'Universidade Estadual de Ciências da Saúde de Alagoas - Maceió - UNCISAL',
  'Universidade Estadual de Feira de Santana- BA - UEFS',
  'Universidade Estadual de Goiás/campus Itumbiara',
  'Universidade Estadual de Londrina - PR - UEL',
  'Universidade Estadual de Maringá/PR - UEM',
  'Universidade Estadual de Mato Grosso do Sul - UEMS',
  'Universidade Estadual de Montes Claros - UNIMONTES',
  'Universidade Estadual de Ponta Grossa - UEPG - PR',
  'Universidade Estadual de Roraima - UERR',
  'Universidade Estadual de Santa Cruz- Ilheus/BA - UESC',
  'Universidade Estadual do Ceará - UECE',
  'Universidade Estadual do Centro Oeste - Guarapuava/PR - UNICENTRO',
  'Universidade Estadual do Maranhão- Caxias - UEMA',
  'Universidade Estadual do Oeste do Paraná - Francisco Beltrão - UNIOESTE',
  'Universidade Estadual do Oeste do Paraná- Cascavel - UNIOESTE',
  'Universidade Estadual do Piauí - Teresina - UESPI',
  'Universidade Estadual do Sudoeste da Bahia- Jequié - UESB',
  'Universidade Estadual do Sudoeste da Bahia-Vitória da Conquista - UESB',
  'Universidade Estadual do Tocantins',
  'Universidade Estadual Paulista Júlio de Mesquita Filho - Botucatu/SP - UNESP',
  'Universidade Federal da Bahia - campus Anísio Teixeira - CAT',
  'Universidade Federal da Bahia - UFBA',
  'Universidade Federal da Fronteira Sul - Chapecó - SC UFFS',
  'Universidade Federal da Fronteira Sul - Passo Fundo -RS - UFFS',
  'Universidade Federal da Grande Dourados - MS - UFGD',
  'Universidade Federal da Integração Latino-Americana,- Foz do Iguaçu /PR - UNILA',
  'Universidade Federal da Paraíba - J. Pessoa - UFPB',
  'Universidade Federal de Alagoas - Arapiraca/AL- UFAL',
  'Universidade Federal de Alagoas - UFAL',
  'Universidade Federal de Alfenas - Alfenas (MG) - UNIFAL',
  'Universidade Federal de Campina Grande - Cajazeiras/PB (UFCG)',
  'Universidade Federal de Campina Grande - UFCG',
  'Universidade Federal de Ciências da Saúde de Porto Alegre - RS - UFCSPA',
  'Universidade Federal de Goias - Campus de Catalão - UFG-UC',
  'Universidade Federal de Goiás - Jataí/Go',
  'Universidade Federal de Goiás - UFG',
  'Universidade Federal de Juiz de Fora - Governador Valadares/MG - UFJF',
  'Universidade Federal de Juiz de Fora - Governador Valadares/MG Autorizado UFJF',
  'Universidade Federal de Juiz de Fora/MG - UFJF',
  'Universidade Federal de Lavras - MG - UFLA',
  'Universidade Federal de Mato Grosso - UFMT',
  'Universidade Federal de Mato Grosso do Sul- Campo Grande - UFMS',
  'Universidade Federal de Minas Gerais - UFMG',
  'Universidade Federal de Ouro Preto/MG - UFOP',
  'Universidade Federal de Pelotas - UFPel',
  'Universidade Federal de Pernambuco - UFPE',
  'Universidade Federal de Pernambuco (UFPE) - Caruaru (PE)',
  'Universidade Federal de Roraima - UFRR',
  'Universidade Federal de Santa Catarina - Campus ARARANGUÁ',
  'Universidade Federal de Santa Catarina - UFSC',
  'Universidade Federal de Santa Maria - RS - UFSM',
  'Universidade Federal de São Carlos - SP - UFSCAR',
  'Universidade Federal de São João Del Rei - MG /Divinópolis - UFSJ',
  'Universidade Federal de São João Del Rei (UFSJ) - São João Del Rei - MG',
  'Universidade Federal de São Paulo - UNIFESP',
  'Universidade Federal de Sergipe - UFS',
  'Universidade Federal de Sergipe - UFS/Campus Lagarto',
  'Universidade Federal de Tocantins - Araguaina/TO - UFT',
  'Universidade Federal de Uberlândia - MG - UFU',
  'Universidade Federal do Acre - UFAC',
  'Universidade Federal do Amapá - UNIFAP',
  'Universidade Federal do Amazonas - campus Coari -AM',
  'Universidade Federal do Amazonas -UFAM',
  'Universidade Federal do Cariri - Campus de Barbalha - UFCA/Barbalha',
  'Universidade Federal do Ceará - UFC',
  'Universidade Federal do Ceará- Campus de Sobral - UFC/Sobral',
  'Universidade Federal do Espírito Santo- UFES',
  'Universidade Federal do Estado do Rio de Janeiro/RJ - UNIRIO',
  'Universidade Federal do Maranhão - São Luis - UFMA',
  'Universidade Federal do Maranhão - UFMA-Pinheiro (MA)',
  'Universidade Federal do Maranhão- UFMA-Imperatriz (MA)',
  'Universidade Federal do Mato Grosso do Sul - UFMS-Três Lagoas/MS',
  'Universidade Federal do Mato Grosso- UFMT-Sinop (MT)',
  'Universidade Federal do Mato Grosso-UFMT- Rondonópolis (MT)',
  'Universidade Federal do Oeste da Bahia -Barreiras/BA - UFOB/Barreiras',
  'Universidade Federal do Pampa - Uruguaiana - RS - UNIPAMPA',
  'Universidade Federal do Pará - UFPA',
  'Universidade Federal do Paraná - campus de TOLEDO - UFPR/TOLEDO',
  'Universidade Federal do Paraná - Curitiba - UFPR',
  'Universidade Federal do Piauí - campus Senador Elvidio N. de Barros - PICOS -PI - UFPI',
  'Universidade Federal do Piauí - UFP/Parnaiba',
  'Universidade Federal do Piauí - UFPI',
  'Universidade Federal do Recôncavo da Bahia - Santo Antônio de Jesus -(BA) - UFRB',
  'Universidade Federal do Rio de Janeiro - UFRJ',
  'Universidade Federal do Rio de Janeiro/Macaé - UFRJ',
  'Universidade Federal do Rio Grande do Norte - UFRN',
  'Universidade Federal do Rio Grande do Norte - UFRN-Caicó/RN',
  'Universidade Federal do Rio Grande do Sul - UFRGS',
  'Universidade Federal do Rio Grande/RS - FURG',
  'Universidade Federal do Sul da Bahia - Teixeira de Freitas/BA - UFSBA',
  'Universidade Federal do Tocantins - Palmas/TO - UFT',
  'Universidade Federal do Triângulo Mineiro - Uberaba - UFTM',
  'Universidade Federal do Vale do São Francisco/Petrolina/PE - UNIVASF',
  'Universidade Federal dos Vales do Jequitinhonha e Mucuri - Diamantina (MG) UFVJM',
  'Universidade Federal dos Vales doo Jequitinhonha e Mucuri - Teófilo Otoni/MG - UFVJM',
  'Universidade Federal Fluminense - Niteroi/ RJ - UFF',
  'Universidade Federal Rural do Semi-Árido - campus de Mossoró - UFERSA/RN',
  'Universidade Feevale - Novo Hamburgo. RS - FEEVALE',
  'Universidade Franciscana - Santa Maria/RS - UFN',
  'Universidade Iguaçu - Itaperuna/RJ - UNIG/Itaperuna',
  'Universidade Iguaçu - Nova Iguaçu - RJ - UNIG/Nova Iguaçu',
  'Universidade Luterana do Brasil - Canoas - RS - ULBRA',
  'Universidade Metropolitana de Santos - SP - UNIMES',
  'Universidade Municipal de São Caetano do Sul - Campus Bela Vista - USCS-SP',
  'Universidade Municipal de São Caetano do Sul-SP - USCS',
  'Universidade Nilton Lins - Manaus - UNINILTONLINS',
  'Universidade Nove de Julho - São Bernardo do Campo . SP - UNINOVE / S.Bernardo',
  'Universidade Nove de Julho - São Paulo - UNINOVE',
  'Universidade Nove de Julho- Mauá. SP - UNINOVE -',
  'Universidade Nove de Julho- Osasco.SP - UNINOVE - OSASCO',
  'Universidade Nove de Julho-SP - Guarulhos - UNINOVE',
  'Universidade Paranaense - Umuarama - UNIPAR - PR',
  'Universidade Positivo- Curitiba/PR - UP',
  'Universidade Potiguar -RN - UnP',
  'Universidade Presidente Antônio Carlos/MG - UNIPAC /Juiz de Fora',
  'Universidade Professor Edson Antônio Velano - Belo Horizonte/MG - UNIFENAS/BH',
  'Universidade Professor Edson Antônio Velano - UNIFENAS/ Alfenas/MG',
  'Universidade Regional de Blumenau - SC - FURB',
  'Universidade Regional do Cariri - URCA',
  'Universidade Regional do Noroeste do Estado do Rio Grande do Sul - UNIJUÍ',
  'Universidade Regional Integrada do Alto Uruguai e das Missões - ERECHIM/RS- URI ERECHIM',
  'Universidade Salvador/BA - UNIFACS',
  'Universidade São Francisco - Bragança Paulista - USF',
  'Universidade São Judas Tadeu - USJT',
  'UNIVERSIDADE TIRADENTES',
  'Universidade Tiradentes - Unit - Estância',
  'Universidade Vale do Rio Doce - MG - UNIVALE',
  'Universidade Veiga de Almeida',
  'Universidade Vila Velha - ES -UVV',
  'Outra faculdade não listada'
]

const SPECIALTIES = [
  'Clínica Médica', 'Cirurgia Geral', 'Pediatria', 'Ginecologia e Obstetrícia',
  'Medicina de Família e Comunidade', 'Medicina Preventiva e Social',
  'Cardiologia', 'Neurologia', 'Ortopedia e Traumatologia', 'Psiquiatria',
  'Dermatologia', 'Infectologia', 'Endocrinologia', 'Gastroenterologia',
  'Pneumologia', 'Nefrologia', 'Reumatologia', 'Hematologia e Hemoterapia',
  'Oftalmologia', 'Otorrinolaringologia', 'Urologia', 'Oncologia Clínica',
  'Anestesiologia', 'Radiologia e Diagnóstico por Imagem', 'Medicina Intensiva',
  'Medicina de Emergência', 'Medicina Nuclear', 'Patologia', 'Anatomia Patológica',
  'Medicina do Trabalho', 'Medicina Legal e Perícia Médica', 'Cirurgia Plástica',
  'Cirurgia Cardiovascular', 'Cirurgia Torácica', 'Cirurgia Pediátrica',
  'Cirurgia de Cabeça e Pescoço', 'Cirurgia do Aparelho Digestivo',
  'Neurocirurgia', 'Medicina Física e Reabilitação', 'Geriatria',
  'Medicina Esportiva', 'Imunologia e Alergia', 'Genética Médica', 'Ainda não sei',
]

const EXAM_YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i)

interface OnboardingData {
  originInstitution: string
  targetInstitutionId: string
  targetSpecialtyId: string
  examDate: string   // ISO date string (YYYY-MM-DD) — data real, nunca apenas o ano
}

interface Props {
  onComplete: () => void
}

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    originInstitution: '',
    targetInstitutionId: '',
    targetSpecialtyId: '',
    examDate: '',
  })
  const [schoolSearch, setSchoolSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { data: institutionsData } = useQuery({
    queryKey: ['user-institutions'],
    queryFn: userApi.institutions,
  })

  const filteredSchools = MEDICAL_SCHOOLS.filter(s =>
    s.toLowerCase().includes(schoolSearch.toLowerCase())
  ).slice(0, 8)

  // Persist "skip" to backend so the user isn't shown onboarding again
  const handleSkip = async () => {
    try {
      await api.post('/user/onboarding', {
        originInstitution: '',
        targetInstitutionId: '',
        targetSpecialtyId: '',
        examDate: '',
        skipped: true,
      })
    } catch {
      // Best-effort: even if it fails, mark locally
    }
    onComplete()
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/user/onboarding', data)
      toast.success('Perfil configurado! Iniciando seu diagnóstico... 🎯', { duration: 3000 })
      onComplete()
      // Redireciona para sessão de diagnóstico (10 questões) em vez do dashboard
      navigate('/questoes?session=10&mode=diagnostico')
    } catch {
      toast.error('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const canNext = () => {
    if (step === 1) return true // Faculdade é opcional
    if (step === 2) return data.targetInstitutionId.length > 0 && data.targetSpecialtyId.length > 0
    if (step === 3) return data.examDate.length > 0
    return false
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        width: '100%', maxWidth: 560,
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Header com progress */}
        <div style={{
          background: 'linear-gradient(135deg, #050D1A 0%, #0F2040 100%)',
          padding: '2rem 2rem 1.5rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Vamos personalizar sua jornada
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3 perguntas rápidas</div>
            </div>
          </div>

          {/* Steps bar */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 99,
                background: s <= step ? 'linear-gradient(90deg, #3B82F6, #14B8A6)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['Objetivo', 'Prova', 'Quando'].map((label, i) => (
              <span key={label} style={{ fontSize: '0.65rem', color: i + 1 <= step ? 'var(--accent-blue)' : 'var(--text-muted)', fontFamily: 'Outfit', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Corpo */}
        <div style={{ padding: '2rem' }}>

          {/* ── Step 1: Prova-alvo e especialidade (era Faculdade, agora o mais importante vem 1º) ── */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={22} color="var(--accent-blue)" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                    <Typewriter text="Qual é sua especialidade-alvo?" />
                  </h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    Isso define quais temas priorizamos para você.
                  </p>
                </div>
              </div>

              {/* Instituição-alvo (prova) */}
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  Qual prova você vai fazer?
                </label>

          {/* ── Step 2: Prova e especialidade ── */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={22} color="var(--accent-teal)" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                    <Typewriter text="Para onde você está mirando?" />
                  </h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Typewriter text="Qual banca/prova e qual especialidade você quer cursar" speed={15} />
                  </p>
                </div>
              </div>

              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                Banca / Programa-alvo
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: '1.25rem', maxHeight: 180, overflowY: 'auto' }}>
                {institutionsData?.data?.map((inst: { id: string; acronym: string; name: string }) => (
                  <button
                    key={inst.id}
                    onClick={() => setData(d => ({ ...d, targetInstitutionId: inst.id }))}
                    style={{
                      padding: '10px 12px', borderRadius: 10, border: '1px solid',
                      borderColor: data.targetInstitutionId === inst.id ? 'var(--accent-teal)' : 'var(--border)',
                      background: data.targetInstitutionId === inst.id ? 'rgba(20,184,166,0.12)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: data.targetInstitutionId === inst.id ? 'var(--accent-teal)' : 'var(--text-primary)' }}>{inst.acronym}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{inst.name}</div>
                  </button>
                ))}
              </div>

              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                Especialidade desejada
              </label>
              <select
                value={data.targetSpecialtyId}
                onChange={e => setData(d => ({ ...d, targetSpecialtyId: e.target.value }))}
                className="input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Selecione uma especialidade...</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* ── Step 3: Data real da prova ── */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={22} color="#FBBF24" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                    <Typewriter text="Quando é sua prova?" />
                  </h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Typewriter text="Vamos calcular seu cronograma com a data exata" speed={15} />
                  </p>
                </div>
              </div>

              {/* Input de data real */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="exam-date"
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}
                >
                  Data da prova (aproximada)
                </label>
                <input
                  id="exam-date"
                  type="date"
                  value={data.examDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setData(d => ({ ...d, examDate: e.target.value }))}
                  className="input"
                  style={{
                    width: '100%',
                    fontSize: '1rem',
                    padding: '12px 16px',
                    boxSizing: 'border-box',
                    colorScheme: 'dark',
                  }}
                  autoFocus
                />
                <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Não sabe o dia exato? Use o primeiro dia do mês esperado.
                </p>
              {/* Resumo */}
            </div>
          )}
        </div>

        {/* Footer / Ações */}
        <div style={{
          padding: '1rem 2rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid var(--border)',
        }}>
          <button
            onClick={() => step > 1 ? setStep(s => (s - 1) as 1 | 2 | 3) : handleSkip()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem',
            }}
          >
            {step > 1 ? <><ChevronLeft size={16} /> Voltar</> : 'Pular'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)}
              disabled={!canNext()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: canNext() ? 1 : 0.4 }}
            >
              Continuar <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || loading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #3B82F6, #14B8A6)', opacity: canNext() ? 1 : 0.4 }}
            >
              {loading ? 'Salvando...' : <><Sparkles size={15} /> Começar diagnóstico</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
