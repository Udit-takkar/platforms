"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";

import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter";
import { TicketTier, Event } from "@prisma/client";
import { useMemo } from "react";
import EventTableActionButton from "./table-actions";

interface EventTableToolbarProps<TData> {
  table: Table<TData>;
  ticketTiers: TicketTier[];
  event: Event;
}
export default function EventTableToolbar<TData>({
  table,
  ticketTiers,
  event,
}: EventTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const ticketFilterOptions = useMemo(() => {
    return ticketTiers.map((ticket) => {
      console.log("ticket: ", ticket);
      return {
        label: ticket.name,
        value: ticket.name,
      };
    });
  }, [ticketTiers]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search"
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("tickets") && (
          <DataTableFacetedFilter
            column={table.getColumn("tickets")}
            title="Tickets"
            options={ticketFilterOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-1 items-center space-x-2">
        <DataTableViewOptions table={table} />
        <EventTableActionButton
          table={table}
          ticketTiers={ticketTiers}
          event={event}
        />
      </div>
    </div>
  );
}
