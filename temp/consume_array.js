function consumeArray(keyword, next_token) {
  switch (keyword) {
    // CONTROL FLOW
    case "if":
    case "br_if":
      return [DATA_TYPE.I32];
    case "drop":
      return [DATA_TYPE.ANY];
    //case "select": break;

    // VARIABLE
    case "local.set":
    case "set_local":
    case "global.set":
    case "set_global":
      return [DATA_TYPE.ANY];

    // I32
    case "i32.clz":
    case "i32.ctz":
    case "i32.popcnt":
    case "i32.eqz":
      return [DATA_TYPE.I32];
    case "i32.add":
    case "i32.sub":
    case "i32.mul":
    case "i32.div_s":
    case "i32.div_u":
    case "i32.rem_s":
    case "i32.rem_u":
    case "i32.and":
    case "i32.or":
    case "i32.xor":
    case "i32.shl":
    case "i32.shr_s":
    case "i32.shr_u":
    case "i32.rotl":
    case "i32.rotr":
    case "i32.eq":
    case "i32.ne":

    case "i32.lt_s":
    case "i32.lt_u":
    case "i32.le_s":
    case "i32.le_u":
    case "i32.gt_s":
    case "i32.gt_u":
    case "i32.ge_s":
    case "i32.ge_u":
      return [DATA_TYPE.I32, DATA_TYPE.I32];

    // I64
    case "i64.clz":
    case "i64.ctz":
    case "i64.popcnt":
    case "i64.eqz":
      return [DATA_TYPE.I64];

    case "i64.add":
    case "i64.sub":
    case "i64.mul":
    case "i64.div_s":
    case "i64.div_u":
    case "i64.rem_s":
    case "i64.rem_u":
    case "i64.and":
    case "i64.or":
    case "i64.xor":
    case "i64.shl":
    case "i64.shr_s":
    case "i64.shr_u":
    case "i64.rotl":
    case "i64.rotr":
    case "i64.eq":
    case "i64.ne":

    case "i64.lt_s":
    case "i64.lt_u":
    case "i64.le_s":
    case "i64.le_u":

    case "i64.gt_s":
    case "i64.gt_u":
    case "i64.ge_s":
    case "i64.ge_u":
      return [DATA_TYPE.I64, DATA_TYPE.I64];

    // F32
    case "f32.neg":
    case "f32.abs":
    case "f32.ceil":
    case "f32.floor":
    case "f32.trunc":
    case "f32.nearest":
    case "f32.sqrt":
      return [DATA_TYPE.F32];
    case "f32.add":
    case "f32.sub":
    case "f32.mul":
    case "f32.div":
    case "f32.copysign":
    case "f32.min":
    case "f32.max":
    case "f32.eq":
    case "f32.ne":
    case "f32.lt":
    case "f32.le":
    case "f32.gt":
    case "f32.ge":
      return [DATA_TYPE.F32, DATA_TYPE.F32];

    // F64
    case "f64.neg":
    case "f64.abs":
    case "f64.ceil":
    case "f64.floor":
    case "f64.trunc":
    case "f64.nearest":
    case "f64.sqrt":
      return [DATA_TYPE.F64];

    case "f64.add":
    case "f64.sub":
    case "f64.mul":
    case "f64.div":
    case "f64.copysign":
    case "f64.min":
    case "f64.max":
    case "f64.eq":
    case "f64.ne":
    case "f64.lt":
    case "f64.le":
    case "f64.gt":
    case "f64.ge":
      return [DATA_TYPE.F64, DATA_TYPE.F64];

    case "i32.trunc_s.f32":
    case "i32.trunc_s/f32":
    case "i32.trunc_s[f32]":
    case "i32.trunc_s_f32":
    case "i32.trunc_f32_s":

    case "i32.trunc_u.f32":
    case "i32.trunc_u/f32":
    case "i32.trunc_u[f32]":
    case "i32.trunc_u_f32":
    case "i32.trunc_f32_u":

    case "i32.reinterpret":
    case "i32.reinterpret.f32":
    case "i32.reinterpret/f32":
    case "i32.reinterpret[f32]":
    case "i32.reinterpret_f32":

    // I64 DATATYPE CONVERSION
    case "i64.trunc_s.f32":
    case "i64.trunc_s/f32":
    case "i64.trunc_s[f32]":
    case "i64.trunc_s_f32":
    case "i64.trunc_f32_s":

    case "i64.trunc_u.f32":
    case "i64.trunc_u/f32":
    case "i64.trunc_u[f32]":
    case "i64.trunc_u_f32":
    case "i64.trunc_f32_u":

    case "f64.promote":
    case "f64.promote.f32":
    case "f64.promote/f32":
    case "f64.promote[f32]":
    case "f64.promote_f32":
      return [DATA_TYPE.F32];

    case "f32.demote":
    case "f32.demote.f64":
    case "f32.demote/f64":
    case "f32.demote[f64]":
    case "f32.demote_f64":

    case "i32.trunc_s.f64":
    case "i32.trunc_s/f64":
    case "i32.trunc_s[f64]":
    case "i32.trunc_s_f64":
    case "i32.trunc_f64_s":

    case "i32.trunc_u.f64":
    case "i32.trunc_u/f64":
    case "i32.trunc_u[f64]":
    case "i32.trunc_u_f64":
    case "i32.trunc_f64_u":

    case "i64.trunc_s.f64":
    case "i64.trunc_s/f64":
    case "i64.trunc_s[f64]":
    case "i64.trunc_s_f64":
    case "i64.trunc_f64_s":

    case "i64.trunc_u.f64":
    case "i64.trunc_u/f64":
    case "i64.trunc_u[f64]":
    case "i64.trunc_u_f64":
    case "i64.trunc_f64_u":

    case "i64.reinterpret":
    case "i64.reinterpret.f64":
    case "i64.reinterpret/f64":
    case "i64.reinterpret[f64]":
    case "i64.reinterpret_f64":
      return [DATA_TYPE.F64];

    case "i64.extend_s":
    case "i64.extend_s.i32":
    case "i64.extend_s/i32":
    case "i64.extend_s[i32]":
    case "i64.extend_s_i32":
    case "i64.extend_i32_s":

    case "i64.extend_u":
    case "i64.extend_u.i32":
    case "i64.extend_u/i32":
    case "i64.extend_u[i32]":
    case "i64.extend_u_i32":
    case "i64.extend_i32_u":

    // F32 DATATYPE CONVERSION
    case "f32.reinterpret":
    case "f32.reinterpret.i32":
    case "f32.reinterpret/i32":
    case "f32.reinterpret[i32]":
    case "f32.reinterpret_i32":

    case "f32.convert_s":
    case "f32.convert_s.i32":
    case "f32.convert_s/i32":
    case "f32.convert_s[i32]":
    case "f32.convert_s_i32":
    case "f32.convert_i32_s":


    case "f32.convert_u":
    case "f32.convert_u.i32":
    case "f32.convert_u/i32":
    case "f32.convert_u[i32]":
    case "f32.convert_u_i32":
    case "f32.convert_u_i32_u":

    case "f64.convert_s.i32":
    case "f64.convert_s/i32":
    case "f64.convert_s[i32]":
    case "f64.convert_s_i32":
    case "f64.convert_i32_s":

    case "f64.convert_u.i32":
    case "f64.convert_u/i32":
    case "f64.convert_u[i32]":
    case "f64.convert_u_i32":
    case "f64.convert_i32_u":
      return [DATA_TYPE.I32];

    case "i32.wrap":
    case "i32.wrap.i64":
    case "i32.wrap/i64":
    case "i32.wrap[i64]":
    case "i32.wrap_i64":

    case "f32.convert_s":
    case "f32.convert_s.i64":
    case "f32.convert_s/i64":
    case "f32.convert_s[i64]":
    case "f32.convert_s_i64":
    case "f32.convert_i64_s":

    case "f32.convert_u":
    case "f32.convert_u.i64":
    case "f32.convert_u/i64":
    case "f32.convert_u[i64]":
    case "f32.convert_u_i64":
    case "f32.convert_i64_u":

    // F64 DATATYPE CONVERSION
    case "f64.reinterpret":
    case "f64.reinterpret.i64":
    case "f64.reinterpret/i64":
    case "f64.reinterpret[i64]":
    case "f64.reinterpret_i64":

    case "f64.convert_s.i64":
    case "f64.convert_s/i64":
    case "f64.convert_s[i64]":
    case "f64.convert_s_i64":
    case "f64.convert_i64_s":

    case "f64.convert_u.i64":
    case "f64.convert_u/i64":
    case "f64.convert_u[i64]":
    case "f64.convert_u_i64":
    case "f64.convert_i64_u":
      return [DATA_TYPE.I64];

    // FUNCTION CALLS
    case "call":
    case "call_indirect":
      return [DATA_TYPE.TYPEDEF];

    // I32 LINEAR MEMORY
    case "i32.load":
    case "i32.load8_s":
    case "i32.load8_u":
    case "i32.load16_s":
    case "i32.load16_u":
      return [DATA_TYPE.I32];

    case "i32.store":
    case "i32.store8":
    case "i32.store16":
      return [DATA_TYPE.I32, DATA_TYPE.I32];

    // I64 LINEAR MEMORY
    case "i64.load":
    case "i64.load8_s":
    case "i64.load8_u":
    case "i64.load16_s":
    case "i64.load16_u":
    case "i64.load32_s":
    case "i64.load32_u":
      return [DATA_TYPE.I32];

    case "i64.store":
    case "i64.store8":
    case "i64.store16":
    case "i64.store32":
      return [DATA_TYPE.I32, DATA_TYPE.I64];

    // F32 LINEAR MEMORY
    case "f32.load":
      return [DATA_TYPE.I32];
    case "f32.store":
      return [DATA_TYPE.I32, DATA_TYPE.F32];

    // F64 LINEAR MEMORY
    case "f64.load":
      return [DATA_TYPE.I32];
    case "f64.store":
      return [DATA_TYPE.I32, DATA_TYPE.F64];
    default: break;

  }
}
