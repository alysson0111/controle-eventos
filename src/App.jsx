import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  CalendarDays,
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  LogOut,
  Lock,
  Mail,
  FileText,
  Package,
} from "lucide-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = supabaseConfigurado ? createClient(supabaseUrl, supabaseAnonKey) : null;

const observacoesPadraoContrato = "Nao incluso buffet, bolo e lembrancinhas.";

const formInicial = {
  nome: "",
  tema: "",
  cliente: "",
  clienteDocumento: "",
  clienteTelefone: "",
  clienteEndereco: "",
  contratadaNome: "",
  contratadaDocumento: "",
  contratadaTelefone: "",
  data: "",
  horario: "",
  local: "",
  valor: "",
  sinal: "",
  dataSinal: "",
  formaPagamento: "",
  chavePix: "",
  nomePix: "",
  status: "Pendente",
  observacoes: observacoesPadraoContrato,
  itens: [],
};

const eventoItemInicial = {
  itemId: "",
  quantidade: "",
  observacao: "",
};

const catalogoItemInicial = {
  nome: "",
  unidade: "un",
  observacao: "",
};

const formasPagamento = ["Pix", "Cartao", "Dinheiro", "Boleto", "Transferencia"];

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [redefinindoSenha, setRedefinindoSenha] = useState(() => window.location.href.includes("type=recovery"));

  useEffect(() => {
    if (!supabase) {
      setLoadingAuth(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, novaSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setRedefinindoSenha(true);
      }

      setSession(novaSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigurado) {
    return <TelaConfiguracao />;
  }

  if (loadingAuth) {
    return <TelaCarregando />;
  }

  if (!session) {
    return <TelaLogin />;
  }

  if (redefinindoSenha) {
    return <TelaRedefinirSenha onConcluido={() => setRedefinindoSenha(false)} />;
  }

  return <SistemaEventos user={session.user} />;
}

function TelaConfiguracao() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-700 to-cyan-600 text-slate-900 flex items-center justify-center p-6">
      <div className="max-w-lg bg-white/80 border border-white/70 rounded-3xl p-7 shadow-xl">
        <h1 className="text-2xl font-black">Configure o Supabase</h1>
        <p className="text-slate-600 mt-3">
          Crie um arquivo <code className="font-bold">.env</code> usando o modelo{" "}
          <code className="font-bold">.env.example</code> e informe sua URL e chave publica anon.
        </p>
      </div>
    </div>
  );
}

function TelaLogin() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function entrar(e) {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) setMensagem(error.message);
    setLoading(false);
  }

  async function cadastrar(e) {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    const { error } = await supabase.auth.signUp({ email, password: senha });

    if (error) {
      setMensagem(error.message);
    } else {
      setMensagem("Cadastro criado. Se o Supabase pedir confirmacao, verifique seu e-mail.");
    }

    setLoading(false);
  }

  async function recuperarSenha() {
    setMensagem("");

    if (!email) {
      setMensagem("Digite seu e-mail para receber o link de redefinicao de senha.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      setMensagem(error.message);
    } else {
      setMensagem("Enviamos um link para refazer sua senha. Verifique seu e-mail.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-700 to-cyan-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-[32px] shadow-2xl p-8 border border-white/70">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 text-cyan-950 flex items-center justify-center mb-4 shadow-lg">
            <CalendarDays size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Controle de Eventos</h1>
          <p className="text-slate-500 mt-2">
            {modoRecuperacao ? "Informe seu e-mail cadastrado para receber o link." : "Acesse seu painel com e-mail e senha."}
          </p>
        </div>

        {modoRecuperacao ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              recuperarSenha();
            }}
            className="space-y-4"
          >
            <label className="block">
              <span className="text-sm font-bold text-slate-700 mb-1 block">E-mail cadastrado</span>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={19} />
                <input
                  type="email"
                  className="input pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@gmail.com"
                  required
                />
              </div>
            </label>

            {mensagem && (
              <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl p-3 text-sm font-medium">
                {mensagem}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 disabled:opacity-60 text-cyan-950 font-black py-3.5 rounded-2xl transition shadow-lg shadow-amber-300/50"
            >
              {loading ? "Enviando..." : "Enviar link de redefinicao"}
            </button>

            <button
              type="button"
              onClick={() => {
                setModoRecuperacao(false);
                setMensagem("");
              }}
              className="w-full text-cyan-700 font-bold hover:underline"
            >
              Voltar para login
            </button>
          </form>
        ) : (
        <form onSubmit={modoCadastro ? cadastrar : entrar} className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700 mb-1 block">E-mail</span>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={19} />
              <input
                type="email"
                className="input pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@gmail.com"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700 mb-1 block">Senha</span>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={19} />
              <input
                type="password"
                className="input pl-12"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Minimo 6 caracteres"
                required
              />
            </div>
          </label>

          {mensagem && (
            <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl p-3 text-sm font-medium">
              {mensagem}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 disabled:opacity-60 text-cyan-950 font-black py-3.5 rounded-2xl transition shadow-lg shadow-amber-300/50"
          >
            {loading ? "Aguarde..." : modoCadastro ? "Criar Conta" : "Entrar"}
          </button>
        </form>
        )}

        {!modoCadastro && !modoRecuperacao && (
          <button
            type="button"
            onClick={() => {
              setModoRecuperacao(true);
              setMensagem("");
            }}
            disabled={loading}
            className="w-full mt-4 text-sm text-cyan-700 font-black hover:underline disabled:opacity-60"
          >
            Esqueci minha senha
          </button>
        )}

        <button
          onClick={() => {
            setModoCadastro(!modoCadastro);
            setModoRecuperacao(false);
            setMensagem("");
          }}
          className={`${modoRecuperacao ? "hidden" : "block"} w-full mt-4 text-cyan-700 font-bold hover:underline`}
        >
          {modoCadastro ? "Ja tenho conta" : "Criar nova conta"}
        </button>
      </div>
    </div>
  );
}

function TelaRedefinirSenha({ onConcluido }) {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function salvarNovaSenha(e) {
    e.preventDefault();
    setMensagem("");

    if (senha.length < 6) {
      setMensagem("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      setMensagem("As senhas digitadas nao conferem.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setMensagem(error.message);
    } else {
      setSucesso(true);
      setMensagem("Senha atualizada com sucesso.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-700 to-cyan-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-[32px] shadow-2xl p-8 border border-white/70">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 text-cyan-950 flex items-center justify-center mb-4 shadow-lg">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Redefinir senha</h1>
          <p className="text-slate-500 mt-2">Cadastre uma nova senha para continuar.</p>
        </div>

        <form onSubmit={salvarNovaSenha} className="space-y-4">
          <Campo label="Nova senha">
            <input
              type="password"
              className="input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Minimo 6 caracteres"
              disabled={sucesso}
              required
            />
          </Campo>

          <Campo label="Confirmar nova senha">
            <input
              type="password"
              className="input"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="Digite novamente"
              disabled={sucesso}
              required
            />
          </Campo>

          {mensagem && (
            <div className={`${sucesso ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"} border rounded-2xl p-3 text-sm font-medium`}>
              {mensagem}
            </div>
          )}

          {sucesso ? (
            <button
              type="button"
              onClick={onConcluido}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-cyan-950 font-black py-3.5 rounded-2xl transition shadow-lg shadow-amber-300/50"
            >
              Entrar no sistema
            </button>
          ) : (
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 disabled:opacity-60 text-cyan-950 font-black py-3.5 rounded-2xl transition shadow-lg shadow-amber-300/50"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function SistemaEventos({ user }) {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [mesEventos, setMesEventos] = useState("");
  const [faturamentoModo, setFaturamentoModo] = useState("total");
  const [mesFaturamento, setMesFaturamento] = useState(() => new Date().toISOString().slice(0, 7));
  const [abaAtiva, setAbaAtiva] = useState("eventos");
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState(formInicial);
  const [itemForm, setItemForm] = useState(eventoItemInicial);
  const [itensCatalogo, setItensCatalogo] = useState([]);
  const [catalogoForm, setCatalogoForm] = useState(catalogoItemInicial);
  const [editandoItemId, setEditandoItemId] = useState(null);

  useEffect(() => {
    buscarEventos();
    buscarItensCatalogo();
  }, []);

  async function buscarEventos() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("data", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setErro(error.message);
    } else {
      setEventos(data || []);
    }

    setCarregando(false);
  }

  async function buscarItensCatalogo() {
    const { data, error } = await supabase
      .from("itens_catalogo")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      setErro(error.message);
    } else {
      setItensCatalogo(data || []);
    }
  }

  function limparFormulario() {
    setForm(formInicial);
    setItemForm(eventoItemInicial);
    setEditandoId(null);
  }

  function adicionarItem() {
    if (!itemForm.itemId) {
      alert("Selecione um item cadastrado.");
      return;
    }

    const itemCatalogo = itensCatalogo.find((item) => item.id === itemForm.itemId);
    if (!itemCatalogo) {
      alert("Item nao encontrado no cadastro.");
      return;
    }

    const novoItem = {
      id: crypto.randomUUID(),
      item_id: itemCatalogo.id,
      descricao: itemCatalogo.nome,
      quantidade: Number(itemForm.quantidade || 1),
      unidade: itemCatalogo.unidade || "un",
      observacao: itemForm.observacao.trim(),
    };

    setForm((atual) => ({ ...atual, itens: [...atual.itens, novoItem] }));
    setItemForm(eventoItemInicial);
  }

  function removerItem(id) {
    setForm((atual) => ({ ...atual, itens: atual.itens.filter((item) => item.id !== id) }));
  }

  function alternarFormaPagamento(forma) {
    setForm((atual) => {
      const selecionadas = textoParaLista(atual.formaPagamento);
      const novasFormas = selecionadas.includes(forma)
        ? selecionadas.filter((item) => item !== forma)
        : [...selecionadas, forma];

      return { ...atual, formaPagamento: novasFormas.join(", ") };
    });
  }

  function colarFormatado(e, campo, formatador) {
    e.preventDefault();
    const valor = e.clipboardData.getData("text");
    setForm((atual) => ({ ...atual, [campo]: formatador(valor) }));
  }

  async function salvarItemCatalogo(e) {
    e.preventDefault();
    setErro("");

    if (!catalogoForm.nome.trim()) {
      alert("Informe o nome do item.");
      return;
    }

    const payload = {
      user_id: user.id,
      nome: catalogoForm.nome.trim(),
      unidade: catalogoForm.unidade.trim() || "un",
      observacao: catalogoForm.observacao.trim(),
    };

    if (editandoItemId) {
      const { error } = await supabase
        .from("itens_catalogo")
        .update(payload)
        .eq("id", editandoItemId)
        .eq("user_id", user.id);

      if (error) {
        setErro(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("itens_catalogo").insert(payload);

      if (error) {
        setErro(error.message);
        return;
      }
    }

    setCatalogoForm(catalogoItemInicial);
    setEditandoItemId(null);
    buscarItensCatalogo();
  }

  function editarItemCatalogo(item) {
    setEditandoItemId(item.id);
    setCatalogoForm({
      nome: item.nome || "",
      unidade: item.unidade || "un",
      observacao: item.observacao || "",
    });
  }

  async function excluirItemCatalogo(id) {
    if (!confirm("Deseja excluir este item do cadastro? Eventos antigos continuam com o item ja selecionado.")) return;

    const { error } = await supabase
      .from("itens_catalogo")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setErro(error.message);
      return;
    }

    buscarItensCatalogo();
  }

  async function salvarEvento(e) {
    e.preventDefault();
    setErro("");

    if (!form.nome || !form.cliente || !form.data || !form.local) {
      alert("Preencha pelo menos: nome do evento, cliente, data e local.");
      return;
    }

    const payload = {
      user_id: user.id,
      nome: form.nome,
      tema: form.tema,
      cliente: form.cliente,
      cliente_documento: form.clienteDocumento,
      cliente_telefone: form.clienteTelefone,
      cliente_endereco: form.clienteEndereco,
      contratada_nome: form.contratadaNome,
      contratada_documento: form.contratadaDocumento,
      contratada_telefone: form.contratadaTelefone,
      data: form.data,
      horario: form.horario || null,
      local: form.local,
      valor: Number(form.valor || 0),
      sinal: Number(form.sinal || 0),
      data_sinal: form.dataSinal || null,
      forma_pagamento: form.formaPagamento,
      chave_pix: form.chavePix,
      nome_pix: form.nomePix,
      status: form.status,
      observacoes: form.observacoes,
      itens: form.itens,
    };

    if (editandoId) {
      const { error } = await supabase
        .from("eventos")
        .update(payload)
        .eq("id", editandoId)
        .eq("user_id", user.id);

      if (error) {
        setErro(mensagemErroSupabase(error));
        return;
      }
    } else {
      const { error } = await supabase.from("eventos").insert(payload);

      if (error) {
        setErro(mensagemErroSupabase(error));
        return;
      }
    }

    limparFormulario();
    buscarEventos();
  }

  function editarEvento(evento) {
    setEditandoId(evento.id);
    setForm({
      nome: evento.nome || "",
      tema: evento.tema || "",
      cliente: evento.cliente || "",
      clienteDocumento: evento.cliente_documento || "",
      clienteTelefone: evento.cliente_telefone || "",
      clienteEndereco: evento.cliente_endereco || "",
      contratadaNome: evento.contratada_nome || "",
      contratadaDocumento: evento.contratada_documento || "",
      contratadaTelefone: evento.contratada_telefone || "",
      data: evento.data || "",
      horario: evento.horario || "",
      local: evento.local || "",
      valor: String(evento.valor || ""),
      sinal: String(evento.sinal || ""),
      dataSinal: evento.data_sinal || "",
      formaPagamento: evento.forma_pagamento || "",
      chavePix: evento.chave_pix || "",
      nomePix: evento.nome_pix || "",
      status: evento.status || "Pendente",
      observacoes: evento.observacoes || "",
      itens: normalizarItens(evento.itens),
    });
    setItemForm(eventoItemInicial);
  }

  async function excluirEvento(id) {
    if (!confirm("Deseja excluir este evento?")) return;

    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setErro(error.message);
      return;
    }

    buscarEventos();
  }

  async function sair() {
    await supabase.auth.signOut();
  }

  const eventosFiltrados = useMemo(() => {
    return eventos.filter((evento) => {
      const itensTexto = normalizarItens(evento.itens).map((item) => item.descricao).join(" ");
      const texto = `${evento.nome} ${evento.tema} ${evento.cliente} ${evento.local} ${evento.status} ${itensTexto}`.toLowerCase();
      const combinaBusca = texto.includes(busca.toLowerCase());
      const combinaStatus = statusFiltro === "Todos" || evento.status === statusFiltro;
      const combinaMes = !mesEventos || (evento.data || "").startsWith(mesEventos);
      return combinaBusca && combinaStatus && combinaMes;
    });
  }, [eventos, busca, statusFiltro, mesEventos]);

  const resumo = useMemo(() => {
    const total = eventos.length;
    const confirmados = eventos.filter((e) => e.status === "Confirmado").length;
    const pendentes = eventos.filter((e) => e.status === "Pendente").length;
    const cancelados = eventos.filter((e) => e.status === "Cancelado").length;
    const faturamento = eventos.reduce((soma, e) => soma + Number(e.valor || 0), 0);
    const eventosDoMes = eventos.filter((e) => (e.data || "").startsWith(mesFaturamento));
    const faturamentoMensal = eventosDoMes.reduce((soma, e) => soma + Number(e.valor || 0), 0);
    const itens = eventos.reduce((soma, e) => soma + normalizarItens(e.itens).length, 0);
    return { total, confirmados, pendentes, cancelados, faturamento, faturamentoMensal, itens };
  }, [eventos, mesFaturamento]);

  const valorFaturamento = faturamentoModo === "mensal" ? resumo.faturamentoMensal : resumo.faturamento;
  const eventosRelatorio = useMemo(() => {
    if (faturamentoModo === "mensal") {
      return eventos.filter((evento) => (evento.data || "").startsWith(mesFaturamento));
    }

    return eventos;
  }, [eventos, faturamentoModo, mesFaturamento]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-700 to-cyan-600 text-slate-900">
      <header className="bg-gradient-to-r from-cyan-900 via-teal-700 to-cyan-600 text-white px-6 py-8 shadow-xl shadow-cyan-950/25 border-b border-white/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm text-white font-black">Eficiência e comodidade para seus eventos</p>
            <h1 className="text-3xl md:text-5xl font-black">Controle de Eventos</h1>
            <p className="text-cyan-50 max-w-2xl mt-2">Eventos, itens de montagem e contratos em um único painel.</p>
          </div>

          <div className="bg-white/15 border border-white/30 rounded-3xl p-4 flex items-center gap-4 shadow-sm backdrop-blur">
            <div>
              <p className="text-xs text-cyan-100">Usuario logado</p>
              <p className="font-bold">{user.email}</p>
            </div>
            <button onClick={sair} className="bg-yellow-400 text-cyan-950 hover:bg-yellow-300 p-3 rounded-2xl transition" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {erro && <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl p-4 font-semibold">{erro}</div>}

        <nav className="bg-white/15 border border-white/25 rounded-3xl shadow-md shadow-cyan-950/20 p-2 grid grid-cols-1 sm:grid-cols-3 gap-2 backdrop-blur">
          <BotaoAba ativo={abaAtiva === "eventos"} onClick={() => setAbaAtiva("eventos")} icon={<CalendarDays size={18} />} texto="Novo Evento" />
          <BotaoAba ativo={abaAtiva === "itens"} onClick={() => setAbaAtiva("itens")} icon={<Package size={18} />} texto="Cadastrar Item" />
          <BotaoAba ativo={abaAtiva === "faturamento"} onClick={() => setAbaAtiva("faturamento")} icon={<DollarSign size={18} />} texto="Faturamento" />
        </nav>

        {abaAtiva === "faturamento" && (
          <>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <CardResumo titulo="Total de Eventos" valor={resumo.total} icon={<CalendarDays />} />
          <CardResumo titulo="Confirmados" valor={resumo.confirmados} icon={<CheckCircle2 />} />
          <CardResumo titulo="Pendentes" valor={resumo.pendentes} icon={<Clock />} />
          <CardResumo titulo="Cancelados" valor={resumo.cancelados} icon={<XCircle />} />
          <CardResumo titulo="Itens em eventos" valor={resumo.itens} icon={<Package />} />
          <CardResumo titulo={faturamentoModo === "mensal" ? "Faturamento Mensal" : "Faturamento Total"} valor={moeda(valorFaturamento)} icon={<DollarSign />} />
        </section>

        <section className="bg-white/85 border border-amber-100 rounded-3xl shadow-md shadow-amber-100/70 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">Faturamento</h2>
            <p className="text-sm text-slate-500">Alterne entre o total geral e o valor de um mes especifico.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="input" value={faturamentoModo} onChange={(e) => setFaturamentoModo(e.target.value)}>
              <option value="total">Total</option>
              <option value="mensal">Mensal</option>
            </select>
            {faturamentoModo === "mensal" && (
              <input type="month" className="input" value={mesFaturamento} onChange={(e) => setMesFaturamento(e.target.value)} />
            )}
          </div>
        </section>
        <RelatorioFaturamento eventos={eventosRelatorio} valorFaturamento={valorFaturamento} modo={faturamentoModo} mes={mesFaturamento} />
          </>
        )}

        {abaAtiva === "itens" && (
        <CatalogoItens
          catalogoForm={catalogoForm}
          setCatalogoForm={setCatalogoForm}
          itensCatalogo={itensCatalogo}
          editandoItemId={editandoItemId}
          salvarItemCatalogo={salvarItemCatalogo}
          editarItemCatalogo={editarItemCatalogo}
          excluirItemCatalogo={excluirItemCatalogo}
          cancelarEdicao={() => {
            setCatalogoForm(catalogoItemInicial);
            setEditandoItemId(null);
          }}
        />
        )}

        {abaAtiva === "eventos" && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white/90 rounded-3xl shadow-lg shadow-amber-100/80 border border-amber-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-cyan-950 p-2 rounded-2xl"><Plus size={20} /></div>
              <h2 className="text-xl font-black">{editandoId ? "Editar Evento" : "Novo Evento"}</h2>
            </div>

            <form onSubmit={salvarEvento} className="space-y-3">
              <Campo label="Nome do evento"><input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Casamento, aniversario..." /></Campo>
              <Campo label="Tema"><input className="input" value={form.tema} onChange={(e) => setForm({ ...form, tema: e.target.value })} placeholder="Ex: Jardim encantado, tropical..." /></Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Data"><input type="date" className="input" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></Campo>
                <Campo label="Horario"><input type="time" className="input" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} /></Campo>
              </div>

              <Campo label="Local"><input className="input" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} placeholder="Local do evento" /></Campo>

              <Campo label="Valor R$"><input type="number" step="0.01" className="input" value={form.valor} onChange={(e) => {
                const valor = e.target.value;
                setForm({ ...form, valor, sinal: valor ? String(Number(valor) / 2) : "" });
              }} placeholder="0" /></Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Sinal R$"><input type="number" step="0.01" className="input" value={form.sinal} onChange={(e) => setForm({ ...form, sinal: e.target.value })} placeholder="0" /></Campo>
                <Campo label="Status">
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Pendente</option>
                    <option>Confirmado</option>
                    <option>Cancelado</option>
                  </select>
                </Campo>
              </div>

              <Campo label="Data para pagamento do sinal">
                <input type="date" className="input" value={form.dataSinal} onChange={(e) => setForm({ ...form, dataSinal: e.target.value })} />
              </Campo>

              <Campo label="Nome da contratante"><input className="input" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Nome da contratante" /></Campo>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Campo label="CPF/CNPJ"><input className="input" value={form.clienteDocumento} onChange={(e) => setForm({ ...form, clienteDocumento: formatarCpf(e.target.value) })} onPaste={(e) => colarFormatado(e, "clienteDocumento", formatarCpf)} placeholder="000.000.000-00" /></Campo>
                <Campo label="Telefone"><input className="input" value={form.clienteTelefone} onChange={(e) => setForm({ ...form, clienteTelefone: formatarTelefone(e.target.value) })} onPaste={(e) => colarFormatado(e, "clienteTelefone", formatarTelefone)} placeholder="(000) 0 0000-0000" /></Campo>
              </div>

              <Campo label="Endereco do cliente"><input className="input" value={form.clienteEndereco} onChange={(e) => setForm({ ...form, clienteEndereco: e.target.value })} placeholder="Rua, numero, cidade" /></Campo>
              <Campo label="Nome da contratada"><input className="input" value={form.contratadaNome} onChange={(e) => setForm({ ...form, contratadaNome: e.target.value })} placeholder="Nome da contratada" /></Campo>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Campo label="CPF/CNPJ"><input className="input" value={form.contratadaDocumento} onChange={(e) => setForm({ ...form, contratadaDocumento: formatarCpf(e.target.value) })} onPaste={(e) => colarFormatado(e, "contratadaDocumento", formatarCpf)} placeholder="000.000.000-00" /></Campo>
                <Campo label="Telefone"><input className="input" value={form.contratadaTelefone} onChange={(e) => setForm({ ...form, contratadaTelefone: formatarTelefone(e.target.value) })} onPaste={(e) => colarFormatado(e, "contratadaTelefone", formatarTelefone)} placeholder="(000) 0 0000-0000" /></Campo>
              </div>

              <FormasPagamentoSelecionaveis
                selecionadas={textoParaLista(form.formaPagamento)}
                alternarFormaPagamento={alternarFormaPagamento}
              />

              {textoParaLista(form.formaPagamento).includes("Pix") && (
                <div className="grid grid-cols-1 gap-3">
                  <Campo label="Chave Pix">
                    <input
                      className="input"
                      value={form.chavePix}
                      onChange={(e) => setForm({ ...form, chavePix: e.target.value })}
                      placeholder="Digite a chave Pix"
                    />
                  </Campo>
                  <Campo label="Nome do favorecido do Pix">
                    <input
                      className="input"
                      value={form.nomePix}
                      onChange={(e) => setForm({ ...form, nomePix: e.target.value })}
                      placeholder="Nome do favorecido"
                    />
                  </Campo>
                </div>
              )}

              <PainelItens
                itemForm={itemForm}
                setItemForm={setItemForm}
                itens={form.itens}
                itensCatalogo={itensCatalogo}
                adicionarItem={adicionarItem}
                removerItem={removerItem}
              />

              <Campo label="Observacoes"><textarea className="input min-h-[180px] resize-y leading-relaxed" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Detalhes importantes" /></Campo>

              <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-cyan-950 font-black py-3 rounded-2xl transition shadow-lg shadow-amber-300/50">
                {editandoId ? "Salvar Alteracoes" : "Cadastrar Evento"}
              </button>

              {editandoId && <button type="button" onClick={limparFormulario} className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-black py-3 rounded-2xl transition">Cancelar edicao</button>}
            </form>
          </div>

          <div className="lg:col-span-2 bg-white/90 rounded-3xl shadow-lg shadow-cyan-100/80 border border-cyan-100 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-black">Eventos Cadastrados</h2>
                <p className="text-sm text-slate-500">Dados carregados direto do Supabase.</p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-nowrap md:flex-1 md:justify-end">
                <div className="relative min-w-0 sm:w-56 md:w-60 sm:flex-none">
                  <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input className="input pl-10" placeholder="Buscar evento ou item..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>
                <div className="relative min-w-0 sm:w-36 md:w-40 sm:flex-none">
                  <CalendarDays size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="month"
                    className="input pl-10"
                    value={mesEventos}
                    onChange={(e) => setMesEventos(e.target.value)}
                    title="Filtrar eventos por mes"
                  />
                </div>
                <select className="input sm:w-28 md:w-32 sm:flex-none" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                  <option>Todos</option>
                  <option>Confirmado</option>
                  <option>Pendente</option>
                  <option>Cancelado</option>
                </select>
              </div>
            </div>

            {carregando ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">Carregando eventos...</div>
            ) : (
              <div className="space-y-4">
                {eventosFiltrados.length === 0 && <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed">Nenhum evento encontrado.</div>}

                {eventosFiltrados.map((evento) => (
                  <EventoCard
                    key={evento.id}
                    evento={evento}
                    user={user}
                    editarEvento={editarEvento}
                    excluirEvento={excluirEvento}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        )}
      </main>
    </div>
  );
}

function BotaoAba({ ativo, onClick, icon, texto }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-black transition ${
        ativo
          ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-cyan-950 shadow-lg shadow-cyan-950/20"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {icon}
      <span>{texto}</span>
    </button>
  );
}

function RelatorioFaturamento({ eventos, valorFaturamento, modo, mes }) {
  return (
    <section className="bg-white/90 rounded-3xl shadow-lg shadow-cyan-100/80 border border-cyan-100 p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-black">Relatorio de Faturamento</h2>
          <p className="text-sm text-slate-500">
            {modo === "mensal" ? `Eventos do mes ${mes}` : "Todos os eventos cadastrados"}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-300 to-amber-400 text-cyan-950 rounded-2xl px-4 py-3 font-black">
          Total: {moeda(valorFaturamento)}
        </div>
      </div>

      {eventos.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-amber-50 rounded-2xl border border-dashed border-amber-200">
          Nenhum evento encontrado para este relatorio.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-amber-100">
                <th className="py-3 pr-4">Data</th>
                <th className="py-3 pr-4">Evento</th>
                <th className="py-3 pr-4">Contratante</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id} className="border-b border-amber-50">
                  <td className="py-3 pr-4 whitespace-nowrap">{formatarData(evento.data)}</td>
                  <td className="py-3 pr-4 font-bold">{evento.nome}</td>
                  <td className="py-3 pr-4">{evento.cliente}</td>
                  <td className="py-3 pr-4">{evento.status}</td>
                  <td className="py-3 text-right font-black">{moeda(evento.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CatalogoItens({
  catalogoForm,
  setCatalogoForm,
  itensCatalogo,
  editandoItemId,
  salvarItemCatalogo,
  editarItemCatalogo,
  excluirItemCatalogo,
  cancelarEdicao,
}) {
  return (
    <section className="bg-white/85 border border-cyan-100 rounded-3xl shadow-md shadow-cyan-100/70 p-5">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-80">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-cyan-950 p-2 rounded-2xl"><Package size={18} /></div>
            <h2 className="text-lg font-black">{editandoItemId ? "Editar Item" : "Cadastrar Item"}</h2>
          </div>

          <form onSubmit={salvarItemCatalogo} className="space-y-3">
            <Campo label="Nome do item"><input className="input" value={catalogoForm.nome} onChange={(e) => setCatalogoForm({ ...catalogoForm, nome: e.target.value })} placeholder="Ex: Mesa rustica" /></Campo>
            <Campo label="Unidade"><input className="input" value={catalogoForm.unidade} onChange={(e) => setCatalogoForm({ ...catalogoForm, unidade: e.target.value })} placeholder="un, m, kit..." /></Campo>
            <Campo label="Observacao"><input className="input" value={catalogoForm.observacao} onChange={(e) => setCatalogoForm({ ...catalogoForm, observacao: e.target.value })} placeholder="Cor, tamanho, detalhe..." /></Campo>
            <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-cyan-950 font-black py-3 rounded-2xl transition shadow-lg shadow-amber-300/40">
              {editandoItemId ? "Salvar Item" : "Cadastrar Item"}
            </button>
            {editandoItemId && (
              <button type="button" onClick={cancelarEdicao} className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-black py-3 rounded-2xl transition">
                Cancelar edicao
              </button>
            )}
          </form>
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-black mb-4">Itens Cadastrados</h2>
          {itensCatalogo.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-amber-50 rounded-2xl border border-dashed border-amber-200">Nenhum item cadastrado.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {itensCatalogo.map((item) => (
                <div key={item.id} className="border border-amber-100 rounded-2xl p-4 bg-gradient-to-br from-white to-amber-50/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{item.nome}</p>
                      <p className="text-sm text-slate-500">Unidade: {item.unidade || "un"}</p>
                      {item.observacao && <p className="text-xs text-slate-500 mt-1">{item.observacao}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => editarItemCatalogo(item)} className="p-2 rounded-xl bg-cyan-100 text-cyan-700 hover:bg-cyan-200" title="Editar item">
                        <Edit size={16} />
                      </button>
                      <button type="button" onClick={() => excluirItemCatalogo(item.id)} className="p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200" title="Excluir item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FormasPagamentoSelecionaveis({ selecionadas, alternarFormaPagamento }) {
  return (
    <div>
      <span className="block text-sm font-bold text-slate-700 mb-2">Forma de pagamento</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {formasPagamento.map((forma) => {
          const marcado = selecionadas.includes(forma);

          return (
            <label
              key={forma}
              className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                marcado ? "bg-cyan-50 border-cyan-300 text-cyan-800 shadow-sm" : "bg-white border-amber-100 text-slate-700 hover:bg-amber-50"
              }`}
            >
              <input
                type="checkbox"
                checked={marcado}
                onChange={() => alternarFormaPagamento(forma)}
                className="h-4 w-4 accent-cyan-600"
              />
              <span className="font-black text-sm">{forma}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function PainelItens({ itemForm, setItemForm, itens, itensCatalogo, adicionarItem, removerItem }) {
  return (
    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-amber-50 to-cyan-50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-white text-cyan-700 border border-cyan-100 p-2 rounded-2xl">
          <Package size={18} />
        </div>
        <h3 className="font-black text-slate-900 leading-tight">Selecionar itens do evento</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <span className="block text-xs font-black text-slate-500 mb-1">Item</span>
          <select className="input" value={itemForm.itemId} onChange={(e) => setItemForm({ ...itemForm, itemId: e.target.value })}>
            <option value="">Selecione um item cadastrado</option>
            {itensCatalogo.map((item) => (
              <option key={item.id} value={item.id}>{item.nome} ({item.unidade || "un"})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
          <label>
            <span className="block text-xs font-black text-slate-500 mb-1">Quantidade</span>
            <input type="number" min="1" className="input" value={itemForm.quantidade} onChange={(e) => setItemForm({ ...itemForm, quantidade: e.target.value })} placeholder="1" />
          </label>
          <button type="button" onClick={adicionarItem} className="self-end h-[50px] bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-cyan-950 font-black rounded-2xl px-4 transition shadow-md shadow-amber-300/40">
            Adicionar
          </button>
        </div>
      </div>

      <label className="block">
        <span className="block text-xs font-black text-slate-500 mb-1">Observacao do item</span>
        <input className="input" value={itemForm.observacao} onChange={(e) => setItemForm({ ...itemForm, observacao: e.target.value })} placeholder="Cor, detalhe, posicionamento..." />
      </label>

      {itens.length > 0 && (
        <div className="space-y-2">
          {itens.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 bg-white border border-cyan-100 rounded-2xl p-4 shadow-sm">
              <div className="min-w-0">
                <p className="font-black text-sm text-slate-900 truncate">{item.descricao}</p>
                <p className="text-xs text-slate-500">{item.quantidade} {item.unidade}{item.observacao ? ` - ${item.observacao}` : ""}</p>
              </div>
              <button type="button" onClick={() => removerItem(item.id)} className="shrink-0 bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-xl transition" title="Remover item">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventoCard({ evento, user, editarEvento, excluirEvento }) {
  const itens = normalizarItens(evento.itens);

  return (
    <div className="border border-amber-100 rounded-3xl p-5 hover:shadow-lg hover:shadow-amber-100/80 transition bg-gradient-to-br from-white to-amber-50/60">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-slate-900">{evento.nome}</h3>
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${statusStyle[evento.status] || statusStyle.Pendente}`}>{evento.status}</span>
          </div>

          {evento.tema && <p className="text-slate-500 font-bold">Tema: {evento.tema}</p>}
          <p className="text-slate-600 font-bold">Contratante: {evento.cliente}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
            <Info icon={<CalendarDays size={16} />} texto={`${formatarData(evento.data)} as ${evento.horario || "--:--"}`} />
            <Info icon={<MapPin size={16} />} texto={evento.local} />
            <Info icon={<DollarSign size={16} />} texto={moeda(evento.valor)} />
          </div>

          {itens.length > 0 && (
            <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-3">
              <div className="flex items-center gap-2 text-cyan-700 font-black text-sm mb-2">
                <Package size={15} />
                <span>{itens.length} itens cadastrados</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {itens.map((item) => (
                  <span key={item.id} className="bg-white border border-cyan-100 rounded-full px-3 py-1 text-xs font-bold text-slate-700">
                    {item.quantidade} {item.unidade} - {item.descricao}
                  </span>
                ))}
              </div>
            </div>
          )}

          {evento.observacoes && <p className="text-sm bg-amber-50 p-3 rounded-2xl text-slate-600 mt-2 border border-amber-100">{evento.observacoes}</p>}
        </div>

        <div className="flex gap-2">
          <button onClick={() => gerarContrato(evento, user)} className="p-3 rounded-2xl bg-teal-100 text-teal-700 hover:bg-teal-200 transition" title="Gerar contrato">
            <FileText size={18} />
          </button>
          <button onClick={() => editarEvento(evento)} className="p-3 rounded-2xl bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition" title="Editar">
            <Edit size={18} />
          </button>
          <button onClick={() => excluirEvento(evento.id)} className="p-3 rounded-2xl bg-red-100 text-red-700 hover:bg-red-200 transition" title="Excluir">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TelaCarregando() {
  return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-teal-50 to-cyan-100 text-cyan-800 flex items-center justify-center font-bold">Carregando sistema...</div>;
}

function CardResumo({ titulo, valor, icon }) {
  return (
    <div className="bg-white/85 border border-amber-100 rounded-3xl p-5 shadow-md shadow-amber-100/70">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 font-bold">{titulo}</p>
          <h3 className="text-2xl font-black mt-1">{valor}</h3>
        </div>
        <div className="bg-gradient-to-br from-amber-100 to-cyan-100 text-cyan-700 p-3 rounded-2xl">{icon}</div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return <label className="block"><span className="block text-sm font-bold text-slate-700 mb-1">{label}</span>{children}</label>;
}

function Info({ icon, texto }) {
  return <div className="flex items-center gap-2"><span className="text-cyan-600">{icon}</span><span>{texto}</span></div>;
}

function normalizarItens(itens) {
  if (!Array.isArray(itens)) return [];
  return itens.map((item) => ({
    id: item.id || crypto.randomUUID(),
    item_id: item.item_id || item.itemId || "",
    descricao: item.descricao || "",
    quantidade: Number(item.quantidade || 1),
    unidade: item.unidade || "un",
    observacao: item.observacao || "",
  }));
}

function gerarContrato(evento, user) {
  const html = montarContratoHtml(evento, user);
  const janela = window.open("", "_blank");

  if (janela) {
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    return;
  }

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `contrato-${slug(evento.nome)}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

function montarContratoHtml(evento, user) {
  const itens = normalizarItens(evento.itens);
  const saldo = Number(evento.valor || 0) - Number(evento.sinal || 0);
  const pagamentoContrato = montarPagamentoContrato(evento, saldo);
  const linhasItens = itens.length
    ? itens.map((item) => `
      <tr>
        <td>${escaparHtml(item.descricao)}</td>
        <td>${item.quantidade}</td>
        <td>${escaparHtml(item.unidade)}</td>
        <td>${escaparHtml(item.observacao || "-")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4">Nenhum item cadastrado.</td></tr>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Contrato - ${escaparHtml(evento.nome)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; line-height: 1.55; margin: 40px; }
    h1 { text-align: center; font-size: 22px; margin-bottom: 28px; }
    h2 { font-size: 15px; margin-top: 24px; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #f3f4f6; }
    .acoes { position: fixed; right: 24px; top: 24px; }
    .acoes button { background: #4f46e5; color: white; border: 0; border-radius: 10px; padding: 10px 14px; font-weight: 700; cursor: pointer; }
    @media print { .acoes { display: none; } body { margin: 24px; } }
  </style>
</head>
<body>
  <div class="acoes"><button onclick="window.print()">Imprimir / salvar PDF</button></div>
  <h1>Contrato de Prestacao de Servicos para Evento</h1>

  <p>
    Pelo presente instrumento particular, as partes abaixo identificadas firmam o presente contrato de prestacao
    de servicos para o evento <strong>${escaparHtml(evento.nome)}</strong>, conforme condicoes descritas.
  </p>
  ${evento.tema ? `<p><strong>Tema do evento:</strong> ${escaparHtml(evento.tema)}</p>` : ""}

  <h2>1. Partes</h2>
  <p>
    <strong>Contratante:</strong> ${escaparHtml(evento.cliente)}<br />
    <strong>CPF/CNPJ:</strong> ${escaparHtml(evento.cliente_documento || "Nao informado")}<br />
    <strong>Telefone:</strong> ${escaparHtml(evento.cliente_telefone || "Nao informado")}<br />
    <strong>Endereco:</strong> ${escaparHtml(evento.cliente_endereco || "Nao informado")}
  </p>
  <p>
    <strong>Contratada:</strong> ${escaparHtml(evento.contratada_nome || user.email)}<br />
    <strong>CPF/CNPJ:</strong> ${escaparHtml(evento.contratada_documento || "Nao informado")}<br />
    <strong>Contato:</strong> ${escaparHtml(evento.contratada_telefone || user.email)}
  </p>

  <h2>2. Dados do evento</h2>
  <p>
    <strong>Data:</strong> ${formatarData(evento.data)}<br />
    <strong>Horario:</strong> ${escaparHtml(evento.horario || "--:--")}<br />
    <strong>Local:</strong> ${escaparHtml(evento.local)}
  </p>

  <h2>3. Itens e materiais incluidos</h2>
  <table>
    <thead>
      <tr><th>Item</th><th>Qtd.</th><th>Unidade</th><th>Observacao</th></tr>
    </thead>
    <tbody>${linhasItens}</tbody>
  </table>

  <h2>4. Valor e pagamento</h2>
  <p>
    O valor total dos servicos e de <strong>${moeda(evento.valor)}</strong>.
    ${pagamentoContrato}
  </p>

  <h2>5. Condicoes gerais</h2>
  <p>
    A contratada prestara os servicos e disponibilizara os itens listados neste contrato para uso no evento.
    Alteracoes de data, local, quantidade de itens ou escopo deverao ser acordadas entre as partes.
    Em caso de alteracao da data, fica consignado a contratada verificar disponibilidade da data pretendida pela contratante.
    Danos, extravios ou mau uso dos itens durante o periodo de disponibilidade poderao gerar cobranca adicional.
  </p>

  <h2>6. Informacoes importantes</h2>
  <p>
    Os valores pagos em carater de entrada em nenhuma hipotese serao devolvidos,
    independente do motivo alegado pelo contratante.
  </p>

  <h2>7. Concordancia</h2>
  <p>
    O pagamento do sinal conforme item 4 caracteriza concordancia integral deste contrato.
  </p>

  <h2>8. Validade do contrato</h2>
  <p>
    Este contrato so tem validade apos o pagamento conforme Item 4.
  </p>

  <h2>9. Observacoes</h2>
  <p>${escaparHtml(evento.observacoes || "Sem observacoes adicionais.")}</p>

</body>
</html>`;
}

function formatarData(data) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function formatarCpf(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);
  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor).slice(0, 12);

  if (numeros.length <= 3) return numeros ? `(${numeros}` : "";
  if (numeros.length <= 4) return `(${numeros.slice(0, 3)}) ${numeros.slice(3)}`;
  if (numeros.length <= 8) return `(${numeros.slice(0, 3)}) ${numeros.slice(3, 4)} ${numeros.slice(4)}`;

  return `(${numeros.slice(0, 3)}) ${numeros.slice(3, 4)} ${numeros.slice(4, 8)}-${numeros.slice(8)}`;
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function montarPagamentoContrato(evento, saldo) {
  const valor = Number(evento.valor || 0);
  const sinal = Number(evento.sinal || 0);
  const percentualSinal = valor > 0 && sinal > 0 ? Math.round((sinal / valor) * 100) : 0;
  const formas = textoParaLista(evento.forma_pagamento);
  const temPix = formas.includes("Pix");
  const dataSinal = evento.data_sinal ? formatarData(evento.data_sinal) : "data combinada entre as partes";
  const dataFesta = evento.data ? formatarData(evento.data) : "dia da festa";
  const pixTexto = temPix
    ? ` via pix${evento.chave_pix ? ` ${escaparHtml(evento.chave_pix)}` : ""}${evento.nome_pix ? ` (${escaparHtml(evento.nome_pix)})` : ""}`
    : formas.length ? ` via ${escaparHtml(formas.join(", "))}` : "";

  if (sinal > 0) {
    return `O pagamento e feito da seguinte forma: ${percentualSinal}%, no valor de ${moeda(sinal)}${pixTexto}, no dia ${dataSinal}, e o restante, no valor de ${moeda(saldo)}, no dia da festa, ${dataFesta}.`;
  }

  return `O pagamento e feito no valor total de ${moeda(valor)}${pixTexto}, no dia da festa, ${dataFesta}.`;
}

function textoParaLista(valor) {
  if (!valor) return [];
  return String(valor)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mensagemErroSupabase(error) {
  const mensagem = error?.message || "Nao foi possivel salvar.";
  const texto = mensagem.toLowerCase();

  if (texto.includes("schema cache") || texto.includes("could not find") || texto.includes("column")) {
    return `${mensagem} Rode novamente o arquivo supabase-eventos.sql no SQL Editor do Supabase e recarregue o app.`;
  }

  return mensagem;
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slug(valor) {
  return String(valor || "evento")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const statusStyle = {
  Confirmado: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Pendente: "bg-amber-100 text-amber-700 border-amber-200",
  Cancelado: "bg-red-100 text-red-700 border-red-200",
};

