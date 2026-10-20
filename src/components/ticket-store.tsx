"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addTicketComment,
  assignTicket,
  createChangeTicket,
  createHelpDeskTicket,
  createInitialState,
  getTicket,
  listTickets,
  loadStateFromStorage,
  recordCabDecision,
  saveStateToStorage,
  type TicketStoreState,
  updateStatus,
} from "@/lib/tickets-logic";
import type {
  CreateChangeInput,
  CreateHelpDeskInput,
  Ticket,
  TicketStatus,
} from "@/lib/types";

type TicketStoreApi = {
  ready: boolean;
  tickets: Ticket[];
  getById: (id: string) => Ticket | undefined;
  createHelpDesk: (input: CreateHelpDeskInput) => Ticket;
  createChange: (input: CreateChangeInput) => Ticket;
  assign: (id: string, agentEmail: string) => void;
  setStatus: (id: string, status: TicketStatus, note?: string) => void;
  addComment: (id: string, author: string, body: string) => void;
  cabDecide: (
    id: string,
    reviewer: string,
    decision: "approved" | "rejected",
    note?: string
  ) => void;
  resetDemo: () => void;
};

const TicketStoreContext = createContext<TicketStoreApi | null>(null);

export function TicketStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<TicketStoreState>(createInitialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadStateFromStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStateToStorage(state);
  }, [state, ready]);

  const commit = useCallback((next: TicketStoreState | null) => {
    if (!next) throw new Error("Unable to update ticket");
    setState(next);
  }, []);

  const api = useMemo<TicketStoreApi>(
    () => ({
      ready,
      tickets: listTickets(state),
      getById: (id) => getTicket(state, id),
      createHelpDesk: (input) => {
        const result = createHelpDeskTicket(state, input);
        setState(result.state);
        return result.ticket;
      },
      createChange: (input) => {
        const result = createChangeTicket(state, input);
        setState(result.state);
        return result.ticket;
      },
      assign: (id, agentEmail) => commit(assignTicket(state, id, agentEmail)),
      setStatus: (id, status, note) =>
        commit(updateStatus(state, id, status, note)),
      addComment: (id, author, body) =>
        commit(addTicketComment(state, id, author, body)),
      cabDecide: (id, reviewer, decision, note) =>
        commit(recordCabDecision(state, id, reviewer, decision, note)),
      resetDemo: () => setState(createInitialState()),
    }),
    [commit, ready, state]
  );

  return (
    <TicketStoreContext.Provider value={api}>
      {children}
    </TicketStoreContext.Provider>
  );
}

export function useTicketStore() {
  const ctx = useContext(TicketStoreContext);
  if (!ctx) {
    throw new Error("useTicketStore must be used within TicketStoreProvider");
  }
  return ctx;
}
