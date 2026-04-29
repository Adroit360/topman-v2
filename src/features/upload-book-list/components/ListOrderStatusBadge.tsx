import { Badge } from "@/components/ui/badge";
import {
  listOrderStatusBadgeVariantMap,
  listOrderStatusLabelMap,
  type ListOrderStatus,
} from "../types/list-order";

export const ListOrderStatusBadge = ({
  status,
}: {
  status: ListOrderStatus;
}) => {
  return (
    <Badge variant={listOrderStatusBadgeVariantMap[status]}>
      {listOrderStatusLabelMap[status]}
    </Badge>
  );
};
