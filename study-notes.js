/* Notas de estudo por ID de cena, independentes da ordem e do perfil. */
(() => {
  const notes = {
    1: [
      'O trabalho estuda a estrutura do dossel das florestas da Amazônia brasileira. Altura do dossel e Índice de Área Foliar (LAI) descrevem dimensões complementares dessa estrutura. A altura indica até onde a copa se eleva. O LAI indica quanta área de folhas existe acima de cada metro quadrado de solo. Florestas de altura semelhante podem ter quantidades de folhas diferentes e, assim, interceptar quantidades diferentes de luz.',
      'O artigo investiga se a altura média do dossel e a área foliar se associam aos mesmos gradientes ambientais e em que medida seus padrões espaciais coincidem. Esta apresentação aprofunda a parte do LAI. O estudo estima o LAI nas faixas sobrevoadas pelo LiDAR do Projeto EBA e relaciona esses valores com variáveis como chuva, demanda atmosférica por água e relevo. A relação aprendida nas faixas permite estimar o LAI em toda a região e investigar os padrões do mapa resultante.',
    ],
    3: [
      'O Índice de Área Foliar, conhecido pela sigla inglesa LAI, é a razão entre a área de folhas e a área de solo correspondente. A divisão pela área de solo permite comparar florestas de tamanhos diferentes usando a mesma referência. Um LAI de 4 equivale a 4 m² de área foliar por metro quadrado de solo, em média, para a área analisada.',
      'O recorte do trabalho é espacial. A quantidade de folhas pode variar entre regiões com regimes distintos de chuva, temperatura, radiação e solo. A análise investiga como essas diferenças de ambiente se associam ao LAI estimado nas faixas do Projeto EBA.',
    ],
    5: [
      'O LAI e a densidade de área foliar (LAD) partem da mesma grandeza, a área das folhas, e usam referências diferentes. O LAI expressa a área foliar acumulada por área de solo, em m²/m². O LAD expressa a área foliar dentro de determinado volume de vegetação, em m²/m³.',
      'Uma medida de LAI caracteriza a quantidade total acima do terreno. Uma sequência de medidas de LAD ao longo da altura revela a distribuição dessa quantidade na copa. O estudo calcula esse perfil de densidade e depois o integra para obter o LAI.',
    ],
    6: [
      'Os 20 m² do esquema representam a área horizontal de solo associada à vegetação analisada. Esse valor é o denominador do LAI. Todo o material foliar acima dessa base entra no numerador, inclusive quando folhas de diferentes alturas se sobrepõem.',
      'A área de referência também serve para comparar lugares. Os mesmos 100 m² de folhas correspondem a LAI 5 sobre 20 m² de solo e a LAI 2,5 sobre 40 m². A quantidade de folhas é a mesma, mas a área foliar por unidade de chão é maior no primeiro caso.',
    ],
    7: [
      'A copa do esquema contém cinco camadas com 20 m² de folhas cada. A soma dessas superfícies dá 100 m² de área foliar sobre os mesmos 20 m² de chão. A sobreposição vertical permite acumular mais superfície foliar do que superfície de solo.',
      'As camadas do desenho ajudam a visualizar a soma. Em uma copa real, as folhas têm orientações diferentes, e a área foliar por camada varia conforme a estrutura da vegetação.',
    ],
    8: [
      'A área foliar acumulada na copa do exemplo é de 100 m². A área de solo da qual essa copa faz parte é de 20 m². A razão 100 ÷ 20 dá LAI 5, convencionalmente expresso como 5 m² de folha por m² de solo.',
      'A notação m²/m² registra o significado das duas áreas mesmo quando suas dimensões se cancelam matematicamente. O resultado representa a área foliar média por metro quadrado de chão na unidade analisada.',
    ],
    9: [
      'LAI 5 equivale a cinco metros quadrados de área foliar para cada metro quadrado de solo, em média. O valor agrega o que existe ao longo de toda a coluna acima dessa área.',
      'Duas copas de LAI 5 podem ter estruturas diferentes. Uma pode concentrar muita área foliar no topo, e a outra pode distribuí-la ao longo de vários estratos. O perfil de densidade de área foliar permite distinguir essas organizações.',
    ],
    10: [
      'Os 50 m³ representam o volume aproximado da copa no exemplo. Esse volume inclui o espaço entre as folhas e ramos. Ele serve de referência para expressar a área de superfície foliar contida dentro da copa.',
      'Copas com o mesmo volume podem ter diferentes densidades se contiverem áreas foliares diferentes. Uma mesma área foliar também pode estar concentrada em um volume pequeno ou distribuída em um volume maior.',
    ],
    11: [
      'O cubo delimita um volume de 1 m³ dentro da copa. Se as folhas que estão nesse volume somam 2 m² de área, a densidade de área foliar é 2 m²/m³.',
      'Um cubo em outro ponto da copa pode conter mais ou menos folhas. O LAD local expressa essa variação de preenchimento dentro da vegetação.',
    ],
    12: [
      'Os 100 m² de folhas distribuídos em 50 m³ de copa produzem um LAD médio de 2 m²/m³. Essa média resume a quantidade de folha por volume em toda a copa do exemplo.',
      'A densidade dentro de um estrato pode ser maior ou menor do que a média da copa. A combinação de camadas densas e abertas determina o valor médio, enquanto o perfil vertical conserva a posição de cada camada.',
    ],
    13: [
      'A densidade foliar informa quanto de superfície de folhas existe em uma porção da copa. Um LAD elevado perto do topo indica que essa região tem muita área foliar por volume. Um valor baixo nas camadas inferiores indica maior abertura nesses volumes.',
      'Um perfil de LAD descreve essa mudança ao longo da altura. É possível comparar a posição de máximos de densidade entre duas copas mesmo quando elas têm a mesma área foliar total.',
    ],
    14: [
      'Cada estrato horizontal representa um intervalo de altura e tem seu próprio LAD. No esquema, a altura é dividida em camadas de 0,5 m. No processamento dos transectos, o manuscrito adotou camadas de 1 m.',
      'A densidade de um estrato, multiplicada pela sua espessura, fornece a parcela do LAI correspondente. Na mesma densidade, dobrar a espessura dobra a área foliar acumulada por unidade de solo.',
    ],
    15: [
      'A contribuição de uma camada para o LAI é o seu LAD multiplicado pela espessura. Um estrato com 2 m²/m³ de área foliar e 0,5 m de espessura contribui com 1 m² de folhas por m² de solo.',
      'O LAI resulta da soma dessas parcelas em toda a coluna. A multiplicação converte m²/m³ em m²/m² e permite combinar corretamente camadas de espessuras diferentes.',
    ],
    16: [
      'O LAI também pode ser escrito como o LAD médio ao longo da coluna multiplicado pela espessura total. Essa média considera a espessura de cada camada. Em camadas iguais, ela coincide com a média aritmética dos valores de LAD.',
      'No manuscrito, a integração é feita sobre estratos de 1 m. Como cada espessura vale numericamente 1, somar os valores das densidades dá o mesmo número, com a unidade final de área foliar por área de solo.',
    ],
    17: [
      'LAI e LAD descrevem aspectos complementares do dossel. O LAI resume a quantidade total de folhas sobre a área de solo. O LAD informa quanto dessa área foliar cabe por unidade de volume e mostra como ela se distribui com a altura.',
      'Os retornos LiDAR registram a vegetação em diferentes alturas. A estimativa começa pela atenuação em cada estrato, passa pelo perfil de LAD e termina na soma das contribuições para o LAI.',
    ],
    18: [
      'A origem da lei está na óptica. Pierre Bouguer investigou o enfraquecimento da luz ao atravessar materiais transparentes em Essai d’optique sur la gradation de la lumière (1729). Johann Heinrich Lambert desenvolveu a relação no livro Photometria (1760, parte V, capítulo I). Em um meio homogêneo, trechos de mesma espessura transmitem a mesma fração da luz que recebem. Se cada trecho transmite metade, dois trechos transmitem um quarto da luz inicial e três transmitem um oitavo. Essa perda multiplicativa gera o decaimento exponencial.',
      'Em 1852, August Beer publicou Bestimmung der Absorption des rothen Lichts in farbigen Flüssigkeiten, sobre a absorção da luz vermelha em líquidos coloridos. Nas páginas 83 e 84, Beer comparou uma solução de sulfato de cobre em um tubo de 10 cm com uma solução de metade da concentração em um tubo de 20 cm. As medições com luz vermelha deram resultados próximos. Quando a absorção da água era desprezível e a diluição preservava o comportamento da substância, o dobro do percurso compensava a metade da concentração. Em notação moderna, para um dado comprimento de onda, a absorbância é proporcional ao produto entre concentração e caminho óptico.',
      'A ligação com as plantas aparece no trabalho de Monsi e Saeki, publicado em 1953. Eles compararam medições de luz dentro de comunidades vegetais com a área foliar acumulada acima do ponto de medição. A intensidade relativa diminuiu aproximadamente de forma exponencial conforme aumentava a quantidade de folhas acima. A inclinação das folhas influenciou a rapidez dessa queda e, portanto, a distribuição de luz disponível para a fotossíntese ao longo do dossel.',
      'Na animação, o feixe do sol perde intensidade ao atravessar cinco estratos de 0,5 m. A fração que passa por cada estrato depende da área foliar daquela camada. A intensidade relativa é de 100% no topo, cai para 74% após o primeiro estrato e chega a aproximadamente 8% no chão.',
    ],
    19: [
      'Na versão para o dossel, a equação I/I₀ = exp(−k × LAI) representa a transmissão relativa. I₀ é a intensidade incidente sobre o dossel, I é a intensidade transmitida e k é o coeficiente de extinção. O LAI da equação é a área foliar acumulada entre o topo e o nível onde I é observado.',
      'A inversão da equação dá LAI = −ln(I/I₀)/k. O logaritmo transforma a redução exponencial em uma área acumulada. No desenho, I/I₀ = 0,08 e k = 0,5 dão LAI de aproximadamente 5,05. Com o mesmo k, uma transmissão menor corresponde a um LAI maior.',
      'A luz solar e o valor de k = 0,5 fazem parte do exemplo didático. O manuscrito usa k = 1 e aproxima a abertura de cada camada por proporções de retornos LiDAR. A partir da fração de abertura, estima-se a densidade foliar local.',
    ],
    20: [
      'O coeficiente de extinção k representa a rapidez com que a transmissão cai para uma dada área foliar acumulada. Nos dados de Monsi e Saeki, comunidades dominadas por folhas mais eretas deixaram a luz avançar mais em profundidade do que comunidades com folhas mais horizontais, que tendem a interceptar mais luz incidente de cima.',
      'O k usado para um dossel depende da forma de medir e da geometria da observação. Uma fotografia hemisférica estima a proporção de céu visível a partir de um ponto. O LiDAR aerotransportado usa a distribuição dos retornos de um pulso emitido de cima. Os dois casos relacionam aberturas e estrutura da copa por geometrias distintas.',
      'O manuscrito emprega k = 1 na adaptação da abordagem de Bouvier et al. (2015). Esse artigo avaliou atributos de inventário florestal a partir de métricas de LiDAR aerotransportado, entre elas descritores do perfil vertical de área foliar obtidos a partir da penetração dos pulsos.',
      'A inversão é LAI = −ln(P)/k. Com abertura P = 0,05, k = 0,35 dá 8,56, k = 0,50 dá 5,99 e k = 1 dá 3,00. Esses valores comparam a sensibilidade ao coeficiente para a mesma entrada ilustrativa. A abertura permanece fixa em todas as comparações.',
    ],
    21: [
      'O LiDAR emite pulsos de laser. Quando o sinal encontra folhas, ramos ou o terreno, parte da energia retorna ao sensor. O intervalo entre a emissão e o retorno permite determinar uma distância. Vários retornos podem ser registrados para o mesmo pulso, representando partes distintas do caminho percorrido.',
      'Na nuvem de pontos dos transectos, a superfície do terreno fornece a referência de altura. A altura acima do solo permite agrupar os retornos por estrato e comparar a distribuição vertical da vegetação em áreas com relevos diferentes.',
    ],
    22: [
      'A fração de lacunas descreve a proporção de trajetórias abertas na direção observada. No desenho simplificado, 8 retornos junto ao solo entre 100 representam uma fração de 0,08. Morsdorf et al. (2006) estudaram essa abordagem usando diferentes tipos de ecos LiDAR e comparando estimativas de abertura com fotografias hemisféricas.',
      'Em um perfil vertical, a referência para cada estrato é o sinal que conseguiu chegar ao seu limite superior. Parte dos pulsos já foi interceptada em estratos acima. A razão entre o que atravessa uma camada e o que pôde alcançá-la aproxima sua abertura local. Essa razão depende da geometria do feixe e da forma como os retornos são detectados.',
    ],
    23: [
      'O perfil vertical reúne os valores de densidade de área foliar de cada estrato. A referência de altura é o terreno. Este desenho didático usa camadas de 0,5 m. A demonstração do procedimento usa camadas de 1 m e começa a integração a 2 m acima do solo.',
      'Uma camada densa pode reduzir significativamente o sinal que chega aos estratos inferiores. A atenuação atribuída a cada camada considera a fração de sinal que a alcança. Assim a estimativa distingue a camada que interceptou o pulso da camada cuja amostragem ficou limitada pela sombra acima.',
    ],
    24: [
      'A contribuição para o LAI de cada camada é o seu LAD multiplicado pela espessura. Neste desenho didático, a espessura é de 0,5 m. Somar as contribuições das camadas transforma o perfil em uma única medida de área foliar por área de solo.',
      'A demonstração seguinte mostra a mesma ideia no recorte de cálculo com camadas de 1 m e integração acima do corte de 2 m.',
    ],
    25: [
      'Um transecto LiDAR é uma faixa de terreno registrada durante o sobrevoo. Cada faixa atravessa um conjunto de copas, clareiras e, dependendo do percurso, diferentes coberturas do solo. O Projeto EBA oferece amostras desse tipo distribuídas pela Amazônia brasileira.',
      'O processamento identifica o terreno, normaliza a altura dos retornos e seleciona as faixas adequadas ao recorte florestal. A análise parte de 817 faixas e usa 742 após os filtros do estudo.',
    ],
    26: [
      'O LAI estimado resume uma faixa inteira. O centroide é o ponto usado para associar esse valor às camadas ambientais. Uma faixa contribui para a tabela com um LAI e um conjunto de preditores extraído nessa coordenada.',
      'Essa representação supõe que as condições ambientais no centroide sejam informativas para a área sobrevoada. Uma faixa com condições internas variadas, como trechos em encostas e fundos de vale, passa a ter essa diversidade resumida a uma única localização.',
    ],
    27: [
      'Os pontos representam a distribuição geográfica das faixas sobrevoadas e mostram o espaço entre as observações. A nuvem de pontos do mapa é ilustrativa. A análise usa especificamente as 742 faixas retidas de um conjunto inicial de 817.',
      'Os filtros consideraram o recorte territorial, a cobertura florestal e a disponibilidade das variáveis ambientais. A cobertura amostral motiva a etapa de modelagem, que usa camadas contínuas para estimar LAI entre as faixas.',
    ],
    28: [
      'O estudo usa 16 preditores para representar condições ambientais diversas. A precipitação caracteriza a oferta de água. A evapotranspiração potencial caracteriza a demanda atmosférica por água. Outros preditores descrevem relevo, radiação, clima, solo e distúrbios.',
      'Os dados seguem o conjunto de variáveis usado por Gorgens et al. (2021). Como as condições ambientais variam juntas em parte do bioma, a contribuição de um preditor deve ser entendida no contexto das outras variáveis usadas pelo modelo.',
    ],
    29: [
      'As camadas ambientais das diferentes fontes foram alinhadas numa grade de 100 m. Em cada célula, a mesma coordenada identifica o valor de chuva, relevo, solo e das demais variáveis. O alinhamento permite tanto a associação das amostras como a aplicação regional do modelo.',
      'Algumas camadas foram produzidas em grades originalmente mais grossas. A reamostragem atribui seus valores às posições da grade comum. A escala em que cada preditor representa diferenças ambientais continua dependendo dos dados de origem.',
    ],
    30: [
      'A localização do centroide de cada faixa define a consulta nas 16 camadas ambientais. O conjunto de valores obtidos forma as entradas do modelo para aquela observação, associadas ao LAI derivado do LiDAR da faixa.',
      'O ajuste descrito no manuscrito usa faixas com valores válidos para o conjunto de preditores. Dessa forma, cada amostra tem a mesma estrutura de dados, embora os valores de cada variável mudem entre os locais.',
    ],
    31: [
      'Cada uma das 742 linhas corresponde a uma faixa e contém o LAI de referência, as 16 variáveis ambientais e o identificador da observação. O LAI derivado do LiDAR é a variável que o modelo procura estimar. As condições ambientais são as entradas usadas para realizar a previsão.',
      'Na validação cruzada, parte dessas linhas fica reservada a cada rodada. O modelo usa seus preditores para fazer previsões, que são comparadas com os valores de referência derivados do LiDAR para as mesmas faixas.',
    ],
    32: [
      'O Random Forest de Leo Breiman reúne muitas árvores ajustadas com variação na amostragem e nas variáveis candidatas a cada divisão. Numa árvore de regressão, as divisões agrupam observações com respostas semelhantes. Cada árvore gera sua própria estimativa com base no grupo ao qual pertence a combinação ambiental consultada.',
      'O estudo usa 500 árvores para prever LAI. Divisões sucessivas permitem representar relações não lineares e interações. Por exemplo, uma divisão com base em precipitação pode ser seguida de uma divisão com base em relevo dentro de apenas um dos grupos.',
    ],
    33: [
      'Na regressão com Random Forest, a predição é a média das estimativas das árvores. Os caminhos variam entre as árvores, de modo que duas árvores podem atribuir valores distintos à mesma combinação de condições ambientais.',
      'No estudo, a média é calculada sobre 500 árvores para cada observação ou célula do mapa. Os valores individuais na animação ilustram como essa agregação funciona.',
    ],
    34: [
      'A importância por permutação mede a perda de capacidade preditiva quando os valores de uma variável são embaralhados entre as observações. Isso rompe a associação entre o valor dessa variável e o restante dos dados daquela faixa. Quanto maior o aumento do erro, mais o modelo dependia da informação original para prever.',
      'Precipitação anual (37,81) e evapotranspiração potencial (37,53) ficaram no topo do ranking apresentado, seguidas por elevação, vento zonal e sazonalidade da chuva. Os números estão na escala da métrica do gráfico. Variáveis correlacionadas podem dividir ou substituir informação preditiva. Por isso, o ranking descreve a dependência do modelo e a direção da associação é investigada à parte com as curvas SHAP.',
    ],
    35: [
      'O LAI derivado do LiDAR nas faixas variou de 0,39 a 4,61. O intervalo de 3,0 a 3,75 concentrou a maior parte dos valores da distribuição apresentada. Esses valores de referência caracterizam a amostra usada para ajustar e avaliar o modelo.',
      'A faixa de maior frequência indica onde há mais informação para o ajuste. A amplitude entre o mínimo e o máximo descreve os limites observados, enquanto as frequências mostram quão representados estão os diferentes intervalos.',
    ],
    36: [
      'O modelo foi avaliado por validação cruzada em 15 partições. Em cada rodada, uma parte dos transectos é usada para avaliar o modelo ajustado nas demais. As previsões são comparadas com o LAI de referência obtido pelo LiDAR nas faixas reservadas.',
      'O manuscrito informa R² = 0,60, RMSE = 0,44 e MAE = 0,32. O R² resume o desempenho frente à variação dos valores de referência. O MAE indica a magnitude média dos desvios em valor absoluto, e o RMSE dá peso maior aos erros grandes. As duas medidas de erro estão na escala do LAI e se referem à avaliação nos transectos.',
    ],
    37: [
      'Lundberg e Lee propuseram o SHAP em 2017 como uma forma de explicar previsões individuais com base nos valores de Shapley da teoria dos jogos. Na analogia, os preditores são os jogadores, e o resultado a repartir é a diferença entre uma previsão do modelo e seu valor de referência.',
      'O princípio é avaliar a contribuição que um preditor acrescenta quando se junta a diferentes combinações dos demais. A decomposição é calculada para uma previsão específica. Assim, a precipitação pode contribuir de modo diferente para duas faixas com condições ambientais distintas.',
    ],
    38: [
      'A previsão é reconstruída somando as contribuições SHAP ao valor de referência do modelo. Uma contribuição positiva eleva a estimativa em relação a essa referência, e uma contribuição negativa a reduz. Esse sinal descreve a participação do preditor na previsão da observação.',
      'O SHAP e a importância por permutação respondem a perguntas complementares. A permutação indica a dependência geral do modelo de uma variável. O SHAP descreve a direção e a magnitude da contribuição para cada previsão e permite comparar o comportamento do modelo ao longo de gradientes ambientais.',
    ],
    39: [
      'A curva SHAP descreve como a contribuição da precipitação anual varia ao longo dos valores de chuva. No manuscrito, a contribuição ficou acima de zero aproximadamente entre 2.082 e 3.444 mm por ano, com um máximo próximo de 2.641 mm. Isso mostra que a relação aprendida pelo modelo muda ao longo do gradiente.',
      'Uma contribuição positiva indica que, para as condições representadas na curva, a precipitação elevou a estimativa em relação à referência do modelo. Essa faixa depende das observações e dos demais preditores incluídos no ajuste. Ela fornece uma hipótese sobre a associação da folhagem com o regime hídrico.',
    ],
    40: [
      'A fAPAR é a fração da radiação fotossinteticamente ativa absorvida pela vegetação. No manuscrito, sua contribuição cresceu com a fAPAR e passou de negativa a positiva perto de 83%. A elevação apresentou aumento mais rápido numa parte inicial do gradiente e depois se aproximou de uma estabilização.',
      'O vento zonal descreve o componente leste–oeste, e o meridional, o componente norte–sul. Suas curvas apresentaram formas diferentes. Os sinais verticais dessas curvas indicam a direção da contribuição para a predição. Os valores horizontais representam a intensidade e o sentido de cada componente de vento.',
    ],
    41: [
      'As três curvas descrevem condições meteorológicas diferentes. A frequência de chuvas intensas registra eventos de precipitação forte. A ocorrência de raios caracteriza a atividade elétrica das tempestades. Os dias de céu limpo representam condições de menor cobertura de nuvens.',
      'O modelo atribuiu contribuição positiva a uma faixa intermediária da frequência de chuvas intensas. Os gráficos de raios e dias claros apresentaram trajetórias mais irregulares. Valores próximos de zero representam contribuições pequenas, e oscilações em trechos pouco amostrados são mais difíceis de interpretar.',
    ],
    42: [
      'A evapotranspiração potencial representa a demanda atmosférica de água sob condições de disponibilidade hídrica. Sua contribuição SHAP diminuiu ao longo do gradiente descrito no manuscrito e mudou de sinal próximo de 1.192 mm. A curva sugere que o modelo previu menor LAI, em relação à referência, em parte do gradiente de maior demanda.',
      'A sazonalidade da chuva descreve a desigualdade da precipitação entre os meses, e a chuva do mês mais úmido destaca o pico anual de oferta de água. A temperatura média representa outra dimensão climática. Juntas, as curvas distinguem diferentes características do regime de água e energia associado à variação predita de LAI.',
    ],
    43: [
      'A sazonalidade da temperatura representa o quanto ela varia ao longo do ano, enquanto a temperatura máxima representa as condições mais quentes. As variáveis de solo acrescentam informação de textura e disponibilidade hídrica. O teor de argila descreve a fração de partículas finas. O teor de água descreve a quantidade de água presente no solo.',
      'O manuscrito relata contribuições mais negativas nos menores teores de argila, aproximando-se de zero ou tornando-se positivas em valores intermediários. O teor de água do solo teve resposta mais irregular. Esses padrões são associações aprendidas junto com os demais preditores, cujos valores também variam ao longo do território.',
    ],
    44: [
      'Nos transectos há dois tipos de informação disponíveis, a estimativa de LAI por LiDAR e as condições ambientais. Fora das faixas, as condições ambientais das camadas contínuas servem como entradas para o modelo. A relação ajustada nas faixas gera a predição onde existe cobertura dessas entradas.',
      'A extrapolação fica mais incerta onde as combinações ambientais têm pouca representação nas 742 amostras. O mapa estende a cobertura da estimativa, e sua qualidade foi avaliada por comparação com o LiDAR nos transectos reservados na validação.',
    ],
    45: [
      'Cada camada ambiental representa uma variável no território. Como as grades estão alinhadas, uma célula identifica a mesma posição em todas as camadas. Para cada posição, o modelo recebe uma linha de dados com 16 valores ambientais.',
      'A célula de 100 m é a unidade em que a previsão foi representada. O detalhe espacial disponível para essa previsão depende da resolução das camadas de entrada e da informação capturada pelo modelo.',
    ],
    46: [
      'Para cada célula com dados válidos, as 500 árvores do Random Forest recebem a combinação de 16 preditores e geram suas estimativas de LAI. A média é atribuída à célula. Repetir a operação sobre a grade produz o mapa contínuo.',
      'O modelo usa, nas células, as relações ajustadas com o LAI de referência dos transectos. O valor de cada célula expressa a estimativa do modelo para aquele conjunto de condições ambientais.',
    ],
    47: [
      'O mapa apresenta valores de LAI elevados no oeste, na Amazônia central e em direção ao Escudo das Guianas. Nas bordas oriental, sudeste e sul, o manuscrito indica áreas extensas com valores preditos abaixo de 2,4. O padrão representa a distribuição estimada da área foliar no bioma.',
      'Os gradientes de precipitação e evapotranspiração potencial contribuíram para a capacidade preditiva do modelo, junto com relevo e outros fatores ambientais. O padrão regional oferece uma base para investigar como esses gradientes se relacionam à estrutura do dossel e para localizar regiões a amostrar.',
    ],
    48: [
      'Cada cor da legenda representa um intervalo de LAI predito. A escala expressa área de folhas por área de solo, em m²/m². Os limites entre cores são escolhas de representação. Valores próximos podem aparecer em classes diferentes se estiverem em lados opostos de um limite.',
      'As classes tornam mais fáceis de identificar os contrastes amplos entre regiões. Diferenças pequenas são melhor descritas pelos valores numéricos de LAI correspondentes às células.',
    ],
    49: [
      'Os valores destacados sobre o mapa exemplificam a magnitude do LAI predito em locais específicos. Eles vêm da aplicação do modelo às camadas ambientais nessas posições. Os valores de referência da validação são estimativas independentes da predição, derivadas dos retornos LiDAR para faixas amostradas.',
      'O marcador localiza um exemplo na grade. A avaliação compara valores no nível das faixas, que resumem um trecho sobrevoado de floresta. Essas duas escalas espaciais orientam a interpretação da comparação.',
    ],
    68: [
      'Os transectos LiDAR forneceram uma referência de área foliar e os preditores ambientais permitiram estender a estimativa para a Amazônia brasileira. A precipitação anual e a evapotranspiração potencial foram as variáveis de maior importância, e o desempenho na validação dos transectos foi moderado.',
      'Uma questão científica em aberto é como o mapa se comporta em áreas distantes das faixas existentes ou com combinações ambientais raras na amostra. Novas medições nessas condições ajudariam a testar a capacidade de generalização do modelo.',
    ],
    52: [
      'Mapear o LAI permite comparar a quantidade de superfície foliar disponível entre regiões da floresta. Essa superfície está envolvida na interceptação da luz, na evapotranspiração e na assimilação de carbono. A distribuição espacial do LAI ajuda a representar essas diferenças em modelos da floresta.',
      'A quantidade e a distribuição das folhas influenciam quanta luz chega ao sub-bosque. A sombra reduz o aquecimento direto do solo e do ar durante o dia. Ao mesmo tempo, a transpiração libera vapor de água. Esses processos, junto com a circulação do ar, ajudam a formar o microclima sob a copa.',
      'Na fotossíntese, as folhas usam energia da luz para incorporar o carbono do CO₂ em açúcares. Parte desses açúcares é usada no metabolismo e parte fornece matéria para formar novos tecidos, entre eles folhas, raízes e madeira. A taxa de crescimento também depende de luz, água, nutrientes e de como a planta distribui o carbono entre seus órgãos.',
      'O LAI expressa quanta superfície foliar existe por unidade de solo. Mudanças na produção e na queda de folhas ao longo do ano podem alterar o índice e as condições em que essas trocas ocorrem.',
    ],
    53: [
      'As três árvores começam com a mesma área de folhas, a mesma distribuição na copa e a mesma área de solo. A primeira permanece como referência. Na segunda, as folhas se espalham por mais estratos verticais. Ao mesmo tempo, o tronco da terceira se alonga e as folhas se redistribuem nas alturas da nova copa.',
      'Os perfis de LAD usam a mesma escala e mostram quanto de área foliar há em cada camada. O perfil da segunda árvore se espalha. O da terceira se espalha e se desloca para cima. A soma das contribuições das camadas permanece igual porque a área foliar total e a área de solo foram mantidas. Por isso, as três árvores conservam o mesmo LAI.',
    ],
    56: [
      'O Projeto EBA registrou a estrutura da floresta em faixas aerotransportadas. Os retornos LiDAR permitem examinar a distribuição vertical da vegetação dentro de cada faixa e estimar o LAI a partir da atenuação dos pulsos.',
      'Entre as faixas, a informação disponível sobre chuva, solo, relevo e outras condições ambientais permite construir uma predição regional. O mapa do slide ilustra os locais sobrevoados. A amostra final do modelo contém 742 faixas.',
    ],
    58: [
      'Qu e colaboradores (2018) usaram métricas de LiDAR para estimar LAI em uma floresta sob exploração seletiva na Amazônia oriental e compararam os resultados com MODIS. Longo e colaboradores usaram 545 transectos do EBA para preparar dados de estrutura florestal, incluindo LAI potencial, para inicializar um modelo de ecossistema.',
      'Valle e colaboradores usaram faixas LiDAR do EBA para identificar tipos de estrutura vertical na Amazônia brasileira. Saimun e Karim investigaram a variabilidade do LAI do MODIS e suas relações com o clima na bacia amazônica. Esses antecedentes mostram diferentes usos de estimativas foliares e de dados de estrutura florestal.',
    ],
    64: [
      'A lacuna discutida no manuscrito é entender como a área foliar varia ao longo dos gradientes ambientais da Amazônia brasileira. Já existem produtos de LAI por satélite e estudos da estrutura florestal por LiDAR. O trabalho investiga quais condições ambientais se associam às diferenças de área foliar no bioma.',
      'O estudo compara o LAI de referência derivado de retornos LiDAR com variáveis de clima, solo, topografia, radiação e distúrbios. As contribuições do modelo descrevem associações preditivas e permitem formular hipóteses sobre os contrastes espaciais da floresta.',
    ],
    65: [
      'O diferencial está na combinação de LAI derivado dos retornos LiDAR em 742 faixas do EBA, 16 preditores ambientais e um mapa contínuo da Amazônia brasileira em uma grade de 100 m. O modelo foi avaliado nas faixas e interpretado por importância das variáveis e contribuições SHAP.',
      'Qu et al. avaliaram LAI por LiDAR em uma área da Amazônia oriental. Longo et al. prepararam dados de estrutura para um modelo de ecossistema. Valle et al. caracterizaram tipos de estrutura vertical, e Saimun e Karim investigaram LAI e clima com MODIS. O presente estudo reúne a referência LiDAR, a interpretação de vários gradientes ambientais e a predição de LAI na escala do bioma brasileiro.',
    ],
    66: [
      'O valor próximo de 6 vem do intervalo do simulador de apoio. O controle de abertura começa em 5%. Substituindo P = 0,05 e k = 0,50 em LAI = −ln(P)/k, obtém-se 5,99. Se a abertura mínima fosse 2%, com o mesmo k, seria possível exibir 7,82. Em termos matemáticos, a estimativa cresce sem limite quando P se aproxima de zero.',
      'Em dados LiDAR, a precisão depende da amostragem. Em uma contagem ideal com N trajetórias incidentes, um único pulso transmitido dá a menor abertura positiva observável, 1/N. Se nenhum pulso passa, ln(0) é indefinido. A densidade dos pulsos, o tamanho da unidade de amostragem e a oclusão pelos estratos superiores afetam a capacidade de distinguir copas muito densas.',
      'A orientação e o agrupamento das folhas mudam a abertura observada para a mesma área foliar. Ramos e troncos também interceptam pulsos, e o ângulo de varredura muda o caminho do feixe pelo dossel. Essas características afetam a interpretação do LAI estimado.',
    ],
    67: [
      'Na visão geral da animação, 100 pulsos entram no topo e 12 chegam à altura de 2 m. Esses valores são ilustrativos. Os dois primeiros metros acima do solo ficam fora da integração. Chegar a 2 m descreve a passagem pelo trecho calculado da copa.',
      'Cada estrato compara quantas trajetórias o alcançam e quantas passam por ele. No estrato de 5–6 m, passam 78 dos 100 pulsos incidentes, então a fração de abertura é 0,78. Na camada seguinte entram esses 78 pulsos e saem 52.',
      'A densidade foliar é estimada por LAD = −ln(P)/(k × Δz), com k = 1 e Δz = 1 m na demonstração. A sequência é 100 → 78 → 52 → 25 → 12. O LAI acima do corte é a soma de LAD × 1 m das quatro camadas, o que dá aproximadamente 2,12 m²/m². Um pulso real pode gerar vários retornos. A animação usa trajetórias ideais para tornar visível o cálculo condicional.',
    ],
  };

  const canopyLight = ['Monsi e Saeki (1953, tradução de 2005) · Luz e produção de matéria nas comunidades vegetais', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4246799/'];
  const airborneLai = ['Bouvier et al. (2015) · Perfis de área foliar e outras métricas de LiDAR para inventário florestal', 'https://doi.org/10.1016/j.rse.2014.10.004'];
  const tropicalLidar = ['Almeida et al. (2019) · Estimativa de perfis foliares e efeito da densidade de pulsos', 'https://www.mdpi.com/2072-4292/11/1/92'];
  const lidarCalibration = ['Hopkinson et al. (2013) · Calibração de LAI efetivo e coeficiente de extinção', 'https://www.sciencedirect.com/science/article/pii/S003442571300165X'];
  const randomForest = ['Breiman (2001) · Random Forests', 'https://doi.org/10.1023/A:1010933404324'];
  const shap = ['Lundberg e Lee (2017) · Artigo que apresenta o SHAP', 'https://proceedings.neurips.cc/paper_files/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html'];
  const references = {
    18: [
      ['Bouguer (1729) · Essai d’optique sur la gradation de la lumière', 'https://zenodo.org/records/1541086'],
      ['Lambert (1760) · Photometria, parte V, capítulo I, p. 388–402', 'https://www.e-rara.ch/zut/content/structure/2814923'],
      ['Beer (1852) · Absorção de luz vermelha em líquidos coloridos, artigo original, p. 78–88', 'https://zenodo.org/records/1799630'],
      canopyLight,
    ],
    19: [canopyLight, airborneLai],
    20: [canopyLight, airborneLai, lidarCalibration],
    22: [
      ['Morsdorf et al. (2006) · Estimativa de LAI a partir de lacunas detectadas por LiDAR', 'https://doi.org/10.1016/j.rse.2006.04.019'],
      airborneLai,
    ],
    23: [airborneLai],
    24: [airborneLai, tropicalLidar],
    32: [randomForest],
    33: [randomForest],
    34: [randomForest],
    37: [shap],
    38: [shap],
    58: [
      ['Qu et al. (2018) · Estimativa de LAI por LiDAR na Amazônia oriental', 'https://www.mdpi.com/2072-4292/10/6/970'],
      ['Longo et al. · Dados de estrutura derivados do EBA', 'https://zenodo.org/records/14768399'],
      ['Valle et al. · Estrutura vertical da Amazônia brasileira', 'https://www.nature.com/articles/s43247-025-02976-w'],
      ['Saimun e Karim · LAI e clima na bacia amazônica', 'https://link.springer.com/article/10.1007/s00704-025-05673-y'],
    ],
    66: [tropicalLidar, lidarCalibration],
    67: [airborneLai, tropicalLidar],
  };

  window.createStudyNotes = ({ current, pause, resume }) => {
    const card = document.querySelector('#presentationCard');
    const stage = document.querySelector('#stage');
    const back = document.querySelector('#studyNotes');
    const trigger = document.querySelector('#btnStudyNotes');
    const heading = document.querySelector('#studyNotesTitle');
    const copy = document.querySelector('#studyNotesCopy');
    const returnButton = document.querySelector('#closeStudyNotes');
    let resumeOnClose = false;
    const isOpen = () => card.classList.contains('is-flipped');
    const open = () => {
      if (isOpen()) return;
      const { scene, title } = current();
      if (!notes[scene]) return;
      resumeOnClose = pause();
      heading.textContent = title;
      copy.replaceChildren();
      notes[scene].forEach(text => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        copy.append(paragraph);
      });
      references[scene]?.forEach(([label, href]) => {
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = label;
        copy.append(link);
      });
      copy.scrollTop = 0;
      stage.inert = true;
      back.inert = false;
      card.classList.add('is-flipped');
      trigger.setAttribute('aria-expanded', 'true');
      returnButton.focus({ preventScroll: true });
    };
    const close = () => {
      card.classList.remove('is-flipped');
      back.inert = true;
      stage.inert = false;
      trigger.setAttribute('aria-expanded', 'false');
      if (resumeOnClose) resume();
      resumeOnClose = false;
      stage.focus({ preventScroll: true });
    };
    const toggle = () => isOpen() ? close() : open();
    trigger.addEventListener('click', open);
    trigger.addEventListener('keydown', event => {
      if (event.code === 'Space' || event.code === 'Enter') event.stopPropagation();
    });
    returnButton.addEventListener('click', close);
    const sync = scene => trigger.toggleAttribute('hidden', !notes[scene]);
    return { toggle, isOpen, sync };
  };
})();
