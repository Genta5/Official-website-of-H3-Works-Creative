"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Smartphone,
  User,
} from "lucide-react";

type Connection = {
  id: string;
  platform: string;
  name: string;
  username: string | null;
  status: string;
};

type Message = {
  id: string;
  externalMessageId: string;
  direction: string;
  messageType: string;
  content: string | null;
  status: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  whatsappId: string | null;
  name: string | null;
  updatedAt: string;
  lastMessage: Message | null;
  _count: {
    messages: number;
  };
};

export default function WhatsAppInboxPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileThread, setMobileThread] = useState(false);

  const activeConnection = connections.find(
    (connection) =>
      connection.platform === "WHATSAPP" &&
      connection.status === "connected"
  );

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [conversationResponse, connectionResponse] = await Promise.all([
        fetch("/api/whatsapp/conversations", {
          credentials: "same-origin",
          cache: "no-store",
        }),
        fetch("/api/platform-connections", {
          credentials: "same-origin",
          cache: "no-store",
        }),
      ]);

      const conversationData = await conversationResponse.json();
      const connectionData = await connectionResponse.json();

      if (!conversationResponse.ok) {
        throw new Error(
          conversationData.error || "Gagal mengambil percakapan."
        );
      }

      if (!connectionResponse.ok) {
        throw new Error(
          connectionData.error || "Gagal mengambil koneksi platform."
        );
      }

      const nextConversations: Conversation[] =
        conversationData.conversations || [];

      const nextConnections: Connection[] =
        connectionData.connections || [];

      setConversations(nextConversations);
      setConnections(nextConnections);

      if (selected) {
        const updatedSelected = nextConversations.find(
          (item) => item.id === selected.id
        );

        if (updatedSelected) {
          setSelected(updatedSelected);
        } else {
          setSelected(null);
          setMessages([]);
          setMobileThread(false);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }, [selected]);

  const loadMessages = useCallback(async (customerId: string) => {
    setLoadingMessages(true);
    setError("");

    try {
      const response = await fetch(
        `/api/whatsapp/conversations/${encodeURIComponent(customerId)}`,
        {
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil riwayat chat.");
      }

      setMessages([...(data.messages || [])].reverse());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil pesan."
      );
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void loadInbox();
  }, []);

  useEffect(() => {
    if (selected) {
      void loadMessages(selected.id);
    }
  }, [selected?.id, loadMessages]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = message.trim();

    if (!content || !selected || !activeConnection || sending) {
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/whatsapp/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          connectionId: activeConnection.id,
          to: selected.whatsappId,
          message: content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Pesan gagal dikirim.");
      }

      setMessage("");
      setNotice("Pesan berhasil diteruskan ke WhatsApp.");
      await loadMessages(selected.id);
      await loadInbox();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Pesan gagal dikirim."
      );
    } finally {
      setSending(false);
    }
  }

  function formatTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            WhatsApp Inbox
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Kelola percakapan pelanggan dari satu tempat.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadInbox()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          {notice}
        </div>
      )}

      {!activeConnection && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Smartphone size={19} className="mt-0.5 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              WhatsApp belum terhubung
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Hubungkan WhatsApp Cloud API dengan status connected sebelum
              mengirim pesan dari Inbox.
            </p>
          </div>
        </div>
      )}

      <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={`border-r border-slate-100 ${
            mobileThread ? "hidden lg:block" : "block"
          }`}
        >
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-800">
                Percakapan
              </h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                {conversations.length} pelanggan
              </span>
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-xs text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                Memuat percakapan...
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <MessageCircle
                  size={30}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 text-sm font-bold text-slate-600">
                  Belum ada percakapan
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Pesan pelanggan yang masuk melalui webhook akan muncul di sini.
                </p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const isActive = selected?.id === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      setSelected(conversation);
                      setMobileThread(true);
                      setNotice("");
                    }}
                    className={`flex w-full items-start gap-3 border-b border-slate-50 p-4 text-left transition hover:bg-slate-50 ${
                      isActive ? "bg-blue-50/70" : "bg-white"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <User size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {conversation.name || conversation.whatsappId}
                        </p>
                        <span className="shrink-0 text-[9px] text-slate-400">
                          {formatDate(conversation.updatedAt)}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-[11px] text-slate-500">
                        {conversation.lastMessage?.content ||
                          "Belum ada pesan"}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        {conversation.whatsappId}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={`flex min-w-0 flex-col ${
            mobileThread ? "flex" : "hidden lg:flex"
          }`}
        >
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                <button
                  type="button"
                  onClick={() => setMobileThread(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                  aria-label="Kembali ke percakapan"
                >
                  <ArrowLeft size={17} />
                </button>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <User size={17} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-slate-800">
                    {selected.name || "Pelanggan WhatsApp"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {selected.whatsappId}
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                  WhatsApp
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
                {loadingMessages ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                    <Loader2 size={16} className="animate-spin" />
                    Memuat pesan...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    Belum ada riwayat pesan.
                  </div>
                ) : (
                  messages.map((item) => {
                    const outgoing = item.direction === "OUTBOUND";

                    return (
                      <div
                        key={item.id}
                        className={`flex ${
                          outgoing ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                            outgoing
                              ? "rounded-br-md bg-emerald-100 text-emerald-950"
                              : "rounded-bl-md border border-slate-100 bg-white text-slate-700"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-xs leading-5">
                            {item.content || `[${item.messageType}]`}
                          </p>

                          <div className="mt-2 flex items-center justify-end gap-1.5 text-[9px] text-slate-400">
                            <span>{formatTime(item.createdAt)}</span>
                            {outgoing &&
                              (["delivered", "read"].includes(item.status) ? (
                                <CheckCheck
                                  size={12}
                                  className="text-blue-600"
                                />
                              ) : (
                                <Check size={12} />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={sendMessage}
                className="border-t border-slate-100 bg-white p-3 sm:p-4"
              >
                <div className="flex items-end gap-2">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={
                      activeConnection
                        ? "Tulis pesan WhatsApp..."
                        : "Hubungkan WhatsApp terlebih dahulu"
                    }
                    disabled={!activeConnection || sending}
                    rows={2}
                    maxLength={4096}
                    className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={
                      !message.trim() || !activeConnection || sending
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Kirim pesan"
                  >
                    {sending ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Send size={17} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-[9px] text-slate-400">
                  Pesan dikirim melalui WhatsApp Cloud API yang terhubung.
                </p>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <MessageCircle size={30} />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-slate-800">
                Pilih percakapan
              </h3>
              <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">
                Pilih pelanggan dari daftar untuk melihat riwayat dan membalas
                pesan WhatsApp.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
