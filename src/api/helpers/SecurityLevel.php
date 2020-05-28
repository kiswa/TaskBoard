<?php
use MyCLabs\Enum\Enum;

final class SecurityLevel extends Enum {
  const ADMIN = 1;
  const BOARD_ADMIN = 2;
  const USER = 3;
  const UNPRIVILEGED = 4;
}

